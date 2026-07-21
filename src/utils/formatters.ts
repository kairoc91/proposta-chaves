import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um número para o padrão de moeda brasileiro (BRL) sem casas decimais (centavos).
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Converte uma string formatada em moeda BRL para número inteiro de reais (sem centavos).
 */
export function parseBRLString(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Formata uma data no formato ISO AAAA-MM-DD para DD/MM/AAAA.
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return dateStr;
  }
}

/**
 * Formata uma data por extenso amigável em português.
 */
export function formatDateLongBR(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    return dateStr;
  }
}
