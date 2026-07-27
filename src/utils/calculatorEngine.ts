import { parseISO, addMonths, addYears, isBefore, startOfDay, endOfMonth, endOfDay, format } from 'date-fns';

export type PaymentCategory = 'sinal' | 'entrada' | 'parcela_intermediaria' | 'chaves';
export type EntryType = 'dinheiro' | 'imovel' | 'veiculo' | 'servico' | 'outros';
export type RecurrenceType = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface PaymentItem {
  id: string;
  category: PaymentCategory;
  description: string;
  value: number;
  entryType?: EntryType;
  recurrence?: RecurrenceType;
  installmentsCount: number;
  startDate: string;
}

export interface Installment {
  id: string;
  itemId: string;
  category: PaymentCategory;
  entryType?: EntryType;
  description: string;
  value: number;
  dueDate: Date;
  dueDateString: string;
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
 * Expande um item de lançamento em suas parcelas individuais com datas calculadas
 * e sinaliza se a data de vencimento precede o limite da entrega das chaves.
 */
export function generateInstallmentsFromItem(item: PaymentItem, keyDeliveryDateStr: string): Installment[] {
  const installments: Installment[] = [];
  
  const rawStart = item.startDate ? parseISO(item.startDate) : new Date();
  const start = isNaN(rawStart.getTime()) ? new Date() : rawStart;

  let keyDeliveryDate: Date | null = null;
  if (keyDeliveryDateStr) {
    const isoStr = keyDeliveryDateStr.length === 7 ? `${keyDeliveryDateStr}-01` : keyDeliveryDateStr;
    const rawKeyDate = parseISO(isoStr);
    if (!isNaN(rawKeyDate.getTime())) {
      keyDeliveryDate = endOfDay(endOfMonth(rawKeyDate));
    }
  }

  const count = Math.max(1, item.installmentsCount || 1);

  for (let i = 0; i < count; i++) {
    let dueDate: Date;

    if (item.category === 'sinal' || (item.category === 'entrada' && !item.recurrence)) {
      dueDate = start;
    } else {
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
 * Calcula o consolidado financeiro da proposta imobiliária, totalizando os valores
 * quitados antes e depois da entrega das chaves e o percentual de cobertura da proposta.
 */
export function calculatePaymentFlow(
  totalProposal: number,
  keyDeliveryDateStr: string,
  paymentItems: PaymentItem[],
  includeKeysInPercent: boolean = false
): CalculationResult {
  const installments: Installment[] = [];

  for (const item of paymentItems) {
    installments.push(...generateInstallmentsFromItem(item, keyDeliveryDateStr));
  }

  installments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  let totalPaidBeforeKeys = 0;
  let totalPaidAfterKeys = 0;

  for (const inst of installments) {
    const isCountedBeforeKeys = inst.category === 'chaves'
      ? includeKeysInPercent
      : inst.isBeforeKeys;

    if (isCountedBeforeKeys) {
      totalPaidBeforeKeys += inst.value;
    } else {
      totalPaidAfterKeys += inst.value;
    }
  }

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
