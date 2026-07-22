import React, { useState, useEffect, useRef } from 'react';
import type { PaymentItem, PaymentCategory, EntryType, RecurrenceType } from '../../utils/calculatorEngine';
import { formatBRL, parseBRLString, formatDateBR } from '../../utils/formatters';
import { Plus, Trash2, CalendarDays, Key, AlertCircle, Wallet } from 'lucide-react';

interface PaymentFormProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  keyDeliveryDate: string;
  totalProposal: number;
}

interface PaymentRowItemProps {
  item: PaymentItem;
  totalProposal: number;
  keyDeliveryDate: string;
  isBlocked: boolean;
  onUpdateItem: (updatedItem: PaymentItem) => void;
  onRemoveItem: (id: string) => void;
}

const PaymentRowItem: React.FC<PaymentRowItemProps> = ({
  item,
  totalProposal,
  keyDeliveryDate,
  isBlocked,
  onUpdateItem,
  onRemoveItem,
}) => {
  const [valueStr, setValueStr] = useState(item.value > 0 ? formatBRL(item.value) : '');
  const [percentStr, setPercentStr] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState(item.installmentsCount || 1);
  const [startDate, setStartDate] = useState(item.startDate || '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(item.recurrence || 'mensal');
  const [entryType, setEntryType] = useState<EntryType>(item.entryType || 'dinheiro');

  const percentInputRef = useRef<HTMLInputElement>(null);

  const setCursorBeforePercent = () => {
    setTimeout(() => {
      if (percentInputRef.current) {
        const val = percentInputRef.current.value;
        const percentIdx = val.indexOf('%');
        if (percentIdx !== -1) {
          percentInputRef.current.setSelectionRange(percentIdx, percentIdx);
        } else {
          percentInputRef.current.setSelectionRange(val.length, val.length);
        }
      }
    }, 0);
  };

  // Sincronizar percentual local quando item ou totalProposal mudar
  useEffect(() => {
    setValueStr(item.value > 0 ? formatBRL(item.value) : '');
    setInstallmentsCount(item.installmentsCount || 1);
    setStartDate(item.startDate || '');
    if (item.recurrence) setRecurrence(item.recurrence);
    if (item.entryType) setEntryType(item.entryType);

    if (totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, item.installmentsCount) : 1;
      const totalGroupVal = item.value * count;
      const p = (totalGroupVal / totalProposal) * 100;
      const rounded = Math.round(p * 100) / 100;
      setPercentStr(rounded > 0 ? String(rounded) : '');
    } else {
      setPercentStr('');
    }
  }, [item.value, item.installmentsCount, item.startDate, item.recurrence, item.entryType, totalProposal]);

  const handleCategoryChange = (newCat: PaymentCategory) => {
    let newDesc = item.description;
    let newEntryType = item.entryType;
    let newRecurrence = item.recurrence;
    let newCount = item.installmentsCount;

    if (newCat === 'sinal') {
      newDesc = 'Sinal de Reserva';
      newCount = 1;
    } else if (newCat === 'entrada') {
      const entryLabels: Record<EntryType, string> = {
        dinheiro: 'Dinheiro', imovel: 'Imóvel', veiculo: 'Veículo', servico: 'Serviço', outros: 'Outro'
      };
      newEntryType = newEntryType || 'dinheiro';
      newDesc = `Entrada - ${entryLabels[newEntryType]}`;
      newCount = 1;
    } else if (newCat === 'parcela_intermediaria') {
      const recLabels: Record<RecurrenceType, string> = {
        mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual'
      };
      newRecurrence = newRecurrence || 'mensal';
      newDesc = `Intermediárias ${recLabels[newRecurrence]}s`;
      newCount = Math.max(1, installmentsCount);
    } else if (newCat === 'chaves') {
      newDesc = 'Saldo de Chaves (À Vista)';
      newCount = 1;
    }

    onUpdateItem({
      ...item,
      category: newCat,
      description: newDesc,
      entryType: newCat === 'entrada' ? newEntryType : undefined,
      recurrence: newCat === 'parcela_intermediaria' ? newRecurrence : undefined,
      installmentsCount: newCount,
    });
  };

  const handleEntryTypeChange = (newEntry: EntryType) => {
    setEntryType(newEntry);
    const entryLabels: Record<EntryType, string> = {
      dinheiro: 'Dinheiro', imovel: 'Imóvel', veiculo: 'Veículo', servico: 'Serviço', outros: 'Outro'
    };
    onUpdateItem({
      ...item,
      entryType: newEntry,
      description: `Entrada - ${entryLabels[newEntry]}`
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseBRLString(raw);
    setValueStr(numeric > 0 ? formatBRL(numeric) : '');

    if (numeric > 0 && totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const totalGroupVal = numeric * count;
      const p = (totalGroupVal / totalProposal) * 100;
      const rounded = Math.round(p * 100) / 100;
      setPercentStr(rounded > 0 ? String(rounded) : '');
    } else if (numeric === 0) {
      setPercentStr('');
    }

    onUpdateItem({ ...item, value: numeric });
  };

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    raw = raw.replace('%', '').replace(',', '.').trim();
    raw = raw.replace(/[^\d.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');

    setPercentStr(raw);

    const p = parseFloat(raw);
    if (!isNaN(p) && p > 0 && totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const totalGroupVal = (p / 100) * totalProposal;
      const valPerInst = totalGroupVal / count;
      setValueStr(formatBRL(valPerInst));
      onUpdateItem({ ...item, value: valPerInst });
    } else if (raw === '') {
      setValueStr('');
      onUpdateItem({ ...item, value: 0 });
    }
  };

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const countVal = parseInt(e.target.value, 10);
    const validCount = isNaN(countVal) || countVal < 1 ? 1 : countVal;
    setInstallmentsCount(validCount);

    if (percentStr && totalProposal > 0) {
      const p = parseFloat(percentStr);
      if (!isNaN(p) && p > 0) {
        const totalGroupVal = (p / 100) * totalProposal;
        const valPerInst = totalGroupVal / validCount;
        setValueStr(formatBRL(valPerInst));
        onUpdateItem({ ...item, installmentsCount: validCount, value: valPerInst });
        return;
      }
    }

    onUpdateItem({ ...item, installmentsCount: validCount });
  };

  const handleRecurrenceChange = (newRec: RecurrenceType) => {
    setRecurrence(newRec);
    const recLabels: Record<RecurrenceType, string> = {
      mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual'
    };
    onUpdateItem({
      ...item,
      recurrence: newRec,
      description: `Intermediárias ${recLabels[newRec]}s`
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    onUpdateItem({ ...item, startDate: newDate });
  };

  const itemTotal = item.value * (item.installmentsCount || 1);
  const itemPercent = totalProposal > 0 ? (itemTotal / totalProposal) * 100 : 0;

  return (
    <div 
      className="payment-list-item animate-fade-in"
      style={{
        background: 'rgb(0, 36, 30)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {/* Se for a categoria ENTRADA */}
      {item.category === 'entrada' ? (
        <>
          {/* LINHA 1 (Entrada): Categoria + Modalidade Entrada */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Categoria
              </label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Modalidade Entrada
              </label>
              <select 
                className="form-select" 
                value={entryType} 
                onChange={(e) => handleEntryTypeChange(e.target.value as EntryType)}
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem' }}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="imovel">Imóvel</option>
                <option value="veiculo">Veículo</option>
                <option value="servico">Serviço</option>
                <option value="outros">Outro</option>
              </select>
            </div>
          </div>

          {/* LINHA 2 (Entrada): Percentual (%) + Valor (R$) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Percentual (%)
              </label>
              <input
                ref={percentInputRef}
                type="text"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Valor (R$)
              </label>
              <input
                type="text"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 3 (Entrada): Vencimento em uma linha sozinho */}
          <div className="form-group">
            <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Vencimento
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <CalendarDays 
                size={15} 
                style={{ position: 'absolute', left: '0.65rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
              />
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={handleDateChange}
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch {}
                }}
                style={{ paddingLeft: '2rem', paddingRight: '0.4rem', fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem 0.55rem 2rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>
        </>
      ) : item.category === 'parcela_intermediaria' ? (
        <>
          {/* INTERMEDIÁRIAS LAYOUT */}
          {/* LINHA 1: Categoria + Recorrência */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Categoria
              </label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Recorrência
              </label>
              <select 
                className="form-select" 
                value={recurrence} 
                onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceType)}
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem' }}
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          {/* LINHA 2: Parcelas (Qtd) + Percentual (%) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Parcelas (Qtd)
              </label>
              <input
                type="number"
                className="form-input"
                value={installmentsCount || ''}
                min={1}
                max={140}
                onChange={handleInstallmentsChange}
                placeholder="1 a 140"
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Percentual (%)
              </label>
              <input
                ref={percentInputRef}
                type="text"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 3: Valor Parcela (R$) + Vencimento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Valor Parcela
              </label>
              <input
                type="text"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Vencimento
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <CalendarDays 
                  size={15} 
                  style={{ position: 'absolute', left: '0.65rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
                />
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={handleDateChange}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker?.();
                    } catch {}
                  }}
                  style={{ paddingLeft: '2rem', paddingRight: '0.4rem', fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem 0.55rem 2rem' }}
                  disabled={isBlocked}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sinal e Chaves */}
          {/* LINHA 1: Categoria + Percentual (%) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Categoria
              </label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Percentual (%)
              </label>
              <input
                ref={percentInputRef}
                type="text"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 2: Valor (R$) + Data de Vencimento / Entrega */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Valor (R$)
              </label>
              <input
                type="text"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.65rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: 'clamp(0.65rem, 2.4vw, 0.75rem)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Vencimento
              </label>
              {item.category === 'chaves' ? (
                <div style={{ fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: 'var(--color-primary)', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '0.55rem 0.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={14} />
                  <span>{keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Na Entrega'}</span>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <CalendarDays 
                    size={15} 
                    style={{ position: 'absolute', left: '0.65rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
                  />
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={handleDateChange}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    style={{ paddingLeft: '2rem', paddingRight: '0.4rem', fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', padding: '0.55rem 0.5rem 0.55rem 2rem' }}
                    disabled={isBlocked}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Linha Inferior: Subtotal (Esquerda) + Excluir (Direita) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '0.5rem', 
        marginTop: '0.2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.8rem'
      }}>
        {/* Esquerda: Subtotal + % */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            Subtotal: {formatBRL(itemTotal)}
          </span>
          {itemPercent > 0 && (
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'var(--color-success-bg)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-success-border)', fontSize: '0.75rem' }}>
              {Number.isInteger(Math.round(itemPercent * 100) / 100)
                ? `${Math.round(itemPercent)}%`
                : `${(Math.round(itemPercent * 100) / 100)}%`}
            </span>
          )}
        </div>

        {/* Direita: Botão Excluir */}
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          className="btn btn-danger btn-sm"
          style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          title="Excluir pagamento"
        >
          <Trash2 size={14} />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentItems,
  setPaymentItems,
  keyDeliveryDate,
  totalProposal,
}) => {
  const isBlocked = !totalProposal || !keyDeliveryDate;

  const handleAddPaymentRow = () => {
    const hasSinal = paymentItems.some(i => i.category === 'sinal');
    const defaultCat: PaymentCategory = hasSinal ? 'entrada' : 'sinal';
    const defaultDesc = defaultCat === 'sinal' ? 'Sinal de Reserva' : 'Entrada - Dinheiro';

    const newPaymentItem: PaymentItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: defaultCat,
      description: defaultDesc,
      value: 0,
      installmentsCount: 1,
      entryType: defaultCat === 'entrada' ? 'dinheiro' : undefined,
      startDate: new Date().toISOString().split('T')[0],
    };

    setPaymentItems((prev) => [newPaymentItem, ...prev]);
  };

  const handleUpdateItem = (updatedItem: PaymentItem) => {
    setPaymentItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleRemoveItem = (id: string) => {
    setPaymentItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Botão de Adicionar Pagamento no Topo */}
      {!isBlocked && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
          <button
            type="button"
            onClick={handleAddPaymentRow}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> ADICIONAR PAGAMENTO
          </button>
        </div>
      )}

      {/* Banner de Aviso de Obrigatoriedade (Laranja) */}
      {isBlocked && (
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#f59e0b', 
          background: 'rgba(245, 158, 11, 0.12)', 
          padding: '0.85rem 1.1rem', 
          borderRadius: '25px', 
          border: '1px solid rgba(245, 158, 11, 0.35)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          marginBottom: '0.5rem' 
        }}>
          <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>PREENCHA O PREÇO E DATA DE ENTREGA NO PAINEL ACIMA</span>
        </div>
      )}

      {/* Lista de Pagamentos Gerados Dinamicamente */}
      {paymentItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem', padding: '2.5rem 0' }}>
          <Wallet size={48} strokeWidth={1} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Nenhum pagamento adicionado ainda</p>
            <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Clique no botão abaixo para adicionar o primeiro item de pagamento.</p>
            <button
              type="button"
              onClick={handleAddPaymentRow}
              className="btn btn-primary"
              disabled={isBlocked}
              style={{ borderRadius: '25px' }}
            >
              <Plus size={18} /> ADICIONAR PAGAMENTO
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {paymentItems.map((item) => (
            <PaymentRowItem
              key={item.id}
              item={item}
              totalProposal={totalProposal}
              keyDeliveryDate={keyDeliveryDate}
              isBlocked={isBlocked}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
