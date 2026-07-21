import { parseISO, addMonths, addYears, isBefore, startOfDay, format } from 'date-fns';

export type PaymentCategory = 'sinal' | 'entrada' | 'parcela_intermediaria' | 'chaves';

export type EntryType = 'dinheiro' | 'imovel' | 'veiculo' | 'servico' | 'outros';

export type RecurrenceType = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface PaymentItem {
  id: string;
  category: PaymentCategory;
  description: string;
  value: number; // Valor de cada parcela
  entryType?: EntryType; // Apenas para categoria 'entrada'
  recurrence?: RecurrenceType; // Para parcelas intermediárias e chaves
  installmentsCount: number; // Quantidade de parcelas (mínimo 1)
  startDate: string; // Data da primeira parcela (ou do pagamento único): AAAA-MM-DD
}

export interface Installment {
  id: string; // ID único: ${itemId}-${index}
  itemId: string;
  category: PaymentCategory;
  entryType?: EntryType;
  description: string;
  value: number;
  dueDate: Date;
  dueDateString: string; // Formato AAAA-MM-DD
  isBeforeKeys: boolean;
}

export interface CalculationResult {
  totalProposal: number;
  totalPaidBeforeKeys: number;
  percentagePaidBeforeKeys: number;
  totalPaidAfterKeys: number;
  installments: Installment[];
}

/**
 * Gera todas as parcelas individuais a partir de um item de pagamento recorrente ou único.
 */
export function generateInstallmentsFromItem(item: PaymentItem, keyDeliveryDateStr: string): Installment[] {
  const installments: Installment[] = [];
  
  const rawStart = item.startDate ? parseISO(item.startDate) : new Date();
  const start = isNaN(rawStart.getTime()) ? new Date() : rawStart;

  const rawKeyDate = keyDeliveryDateStr ? parseISO(keyDeliveryDateStr) : null;
  const hasKeyDate = rawKeyDate && !isNaN(rawKeyDate.getTime());
  const keyDeliveryDate = hasKeyDate ? startOfDay(rawKeyDate) : null;

  const count = Math.max(1, item.installmentsCount || 1);

  for (let i = 0; i < count; i++) {
    let dueDate: Date;

    if (item.category === 'sinal' || (item.category === 'entrada' && !item.recurrence)) {
      // Sinal e Entrada sem recorrência são pagamentos únicos na data de início
      dueDate = start;
    } else {
      // Itens recorrentes (intermediárias, chaves parceladas, etc.)
      const recurrence = item.recurrence || 'mensal';
      switch (recurrence) {
        case 'mensal':
          dueDate = addMonths(start, i);
          break;
        case 'trimestral':
          dueDate = addMonths(start, i * 3);
          break;
        case 'semestral':
          dueDate = addMonths(start, i * 6);
          break;
        case 'anual':
          dueDate = addYears(start, i);
          break;
        default:
          dueDate = addMonths(start, i);
      }
    }

    const dueDateStartOfDay = startOfDay(dueDate);
    // Se a data de entrega das chaves for fornecida, compara se a parcela vence estritamente ANTES das chaves.
    // Se NÃO for fornecida data de entrega ainda, considera a parcela como parte do montante (true).
    const isBeforeKeys = keyDeliveryDate ? isBefore(dueDateStartOfDay, keyDeliveryDate) : true;
    const dueDateString = format(dueDate, 'yyyy-MM-dd');

    installments.push({
      id: `${item.id}-${i}`,
      itemId: item.id,
      category: item.category,
      entryType: item.entryType,
      description: count > 1 
        ? `${item.description} (${i + 1}/${count})`
        : item.description,
      value: item.value,
      dueDate: dueDateStartOfDay,
      dueDateString,
      isBeforeKeys,
    });
  }

  return installments;
}

/**
 * Orquestra o cálculo completo do fluxo de pagamentos em relação ao valor da proposta e a data de chaves.
 */
export function calculatePaymentFlow(
  totalProposal: number,
  keyDeliveryDateStr: string,
  paymentItems: PaymentItem[],
  includeKeysInPercent: boolean = false
): CalculationResult {
  const installments: Installment[] = [];

  // 1. Gerar todas as parcelas
  for (const item of paymentItems) {
    installments.push(...generateInstallmentsFromItem(item, keyDeliveryDateStr));
  }

  // Ordenar parcelas por data de vencimento
  installments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // 2. Filtrar e somar
  let totalPaidBeforeKeys = 0;
  let totalPaidAfterKeys = 0;

  for (const inst of installments) {
    // Se for item da categoria 'chaves', obedece à preferência do usuário (includeKeysInPercent)
    const isCountedBeforeKeys = inst.category === 'chaves'
      ? includeKeysInPercent
      : inst.isBeforeKeys;

    if (isCountedBeforeKeys) {
      totalPaidBeforeKeys += inst.value;
    } else {
      totalPaidAfterKeys += inst.value;
    }
  }

  // 3. Percentual pago
  const percentagePaidBeforeKeys = totalProposal > 0 
    ? (totalPaidBeforeKeys / totalProposal) * 100 
    : 0;

  return {
    totalProposal,
    totalPaidBeforeKeys,
    percentagePaidBeforeKeys,
    totalPaidAfterKeys,
    installments,
  };
}
