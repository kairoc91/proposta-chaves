import { describe, it, expect } from 'vitest';
import {
  generateInstallmentsFromItem,
  calculatePaymentFlow,
  type PaymentItem,
} from './calculatorEngine';

describe('calculatorEngine', () => {
  describe('generateInstallmentsFromItem', () => {
    it('deve gerar parcela única para sinal de reserva', () => {
      const item: PaymentItem = {
        id: 'item-1',
        category: 'sinal',
        description: 'Sinal de Reserva',
        value: 50000,
        installmentsCount: 1,
        startDate: '2026-01-10',
      };

      const result = generateInstallmentsFromItem(item, '2026-12');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1-0');
      expect(result[0].value).toBe(50000);
      expect(result[0].isBeforeKeys).toBe(true);
      expect(result[0].dueDateString).toBe('2026-01-10');
    });

    it('deve gerar 12 parcelas mensais corretamente', () => {
      const item: PaymentItem = {
        id: 'item-2',
        category: 'parcela_intermediaria',
        description: 'Parcela Mensal',
        value: 2000,
        recurrence: 'mensal',
        installmentsCount: 12,
        startDate: '2026-01-15',
      };

      const result = generateInstallmentsFromItem(item, '2026-12');

      expect(result).toHaveLength(12);
      expect(result[0].dueDateString).toBe('2026-01-15');
      expect(result[11].dueDateString).toBe('2026-12-15');
      expect(result[0].description).toBe('Parcela Mensal (1/12)');
      expect(result[11].description).toBe('Parcela Mensal (12/12)');
    });

    it('deve calcular isBeforeKeys como false para parcelas após a data de entrega das chaves', () => {
      const item: PaymentItem = {
        id: 'item-3',
        category: 'parcela_intermediaria',
        description: 'Parcela Anual',
        value: 10000,
        recurrence: 'anual',
        installmentsCount: 3,
        startDate: '2026-01-01',
      };

      // Chaves em Dez/2026 (fim do mês: 31/12/2026)
      const result = generateInstallmentsFromItem(item, '2026-12');

      expect(result).toHaveLength(3);
      // Ano 2026: antes das chaves
      expect(result[0].isBeforeKeys).toBe(true);
      // Ano 2027: após as chaves
      expect(result[1].isBeforeKeys).toBe(false);
      // Ano 2028: após as chaves
      expect(result[2].isBeforeKeys).toBe(false);
    });
  });

  describe('calculatePaymentFlow', () => {
    it('deve calcular corretamente os totais e percentuais pagos até a entrega', () => {
      const items: PaymentItem[] = [
        {
          id: 'sinal-1',
          category: 'sinal',
          description: 'Sinal de Reserva',
          value: 100000,
          installmentsCount: 1,
          startDate: '2026-01-01',
        },
        {
          id: 'parcela-1',
          category: 'parcela_intermediaria',
          description: 'Parcela Mensal',
          value: 10000,
          recurrence: 'mensal',
          installmentsCount: 10,
          startDate: '2026-01-01',
        },
      ];

      // Proposta: R$ 1.000.000. Lançado antes das chaves: 100k + 100k (10x10k) = 200k (20%)
      const result = calculatePaymentFlow(1000000, '2026-12', items);

      expect(result.totalProposal).toBe(1000000);
      expect(result.totalPaidBeforeKeys).toBe(200000);
      expect(result.percentagePaidBeforeKeys).toBe(20);
      expect(result.installments).toHaveLength(11);
    });

    it('deve incluir o valor de chaves no percentual se includeKeysInPercent for true', () => {
      const items: PaymentItem[] = [
        {
          id: 'chaves-1',
          category: 'chaves',
          description: 'Saldo de Chaves',
          value: 300000,
          installmentsCount: 1,
          startDate: '2026-12-01',
        },
      ];

      const resultWithoutKeys = calculatePaymentFlow(1000000, '2026-12', items, false);
      expect(resultWithoutKeys.totalPaidBeforeKeys).toBe(0);

      const resultWithKeys = calculatePaymentFlow(1000000, '2026-12', items, true);
      expect(resultWithKeys.totalPaidBeforeKeys).toBe(300000);
      expect(resultWithKeys.percentagePaidBeforeKeys).toBe(30);
    });
  });
});
