import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  parseBRLString,
  formatDateBR,
  formatMonthYearBR,
} from './formatters';

describe('formatters', () => {
  describe('formatBRL', () => {
    it('deve formatar número para moeda BRL sem casas decimais', () => {
      const formatted = formatBRL(500000);
      expect(formatted).toContain('500.000');
      expect(formatted).toContain('R$');
    });

    it('deve formatar 0 corretamente', () => {
      const formatted = formatBRL(0);
      expect(formatted).toContain('0');
      expect(formatted).toContain('R$');
    });
  });

  describe('parseBRLString', () => {
    it('deve extrair o valor numérico de uma string formatada em BRL', () => {
      expect(parseBRLString('R$ 500.000')).toBe(500000);
      expect(parseBRLString('R$ 1.500')).toBe(1500);
      expect(parseBRLString('100')).toBe(100);
    });

    it('deve retornar 0 para string vazia ou inválida', () => {
      expect(parseBRLString('')).toBe(0);
      expect(parseBRLString('abc')).toBe(0);
    });
  });

  describe('formatDateBR', () => {
    it('deve formatar AAAA-MM-DD para DD/MM/AAAA', () => {
      expect(formatDateBR('2026-07-27')).toBe('27/07/2026');
    });

    it('deve tratar formato AAAA-MM retornando MM/AAAA', () => {
      expect(formatDateBR('2026-07')).toBe('07/2026');
    });
  });

  describe('formatMonthYearBR', () => {
    it('deve formatar AAAA-MM ou AAAA-MM-DD para MM/AAAA', () => {
      expect(formatMonthYearBR('2026-07')).toBe('07/2026');
      expect(formatMonthYearBR('2026-07-27')).toBe('07/2026');
    });
  });
});
