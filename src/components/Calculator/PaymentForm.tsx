import React, { useState, useEffect, useRef } from 'react';
import type { PaymentItem, PaymentCategory, EntryType, RecurrenceType } from '../../utils/calculatorEngine';
import { formatBRL, parseBRLString, formatDateBR } from '../../utils/formatters';
import { Plus, X, Key, AlertCircle, AlertTriangle, Wallet } from 'lucide-react';
import { DateInput } from './DateInput';

interface PaymentFormProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  keyDeliveryDate: string;
  totalProposal: number;
  step2Warning?: string | null;
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
    let numeric = parseBRLString(raw);

    if (numeric > 0 && totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const maxAllowedValuePerInst = totalProposal / count;
      if (numeric > maxAllowedValuePerInst) {
        numeric = maxAllowedValuePerInst;
        window.alert('Valor excede ao total');
      }

      setValueStr(formatBRL(numeric));
      const totalGroupVal = numeric * count;
      const p = (totalGroupVal / totalProposal) * 100;
      const rounded = Math.round(p * 100) / 100;
      setPercentStr(rounded > 0 ? String(rounded) : '');
    } else {
      setValueStr(numeric > 0 ? formatBRL(numeric) : '');
      if (numeric === 0) {
        setPercentStr('');
      }
    }

    onUpdateItem({ ...item, value: numeric });
  };

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    raw = raw.replace('%', '').replace(',', '.').trim();
    raw = raw.replace(/[^\d.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');

    let p = parseFloat(raw);
    if (!isNaN(p) && p > 100) {
      p = 100;
      raw = '100';
      window.alert('Valor excede ao total');
    }

    setPercentStr(raw);

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
    const raw = e.target.value;
    if (raw === '') {
      setInstallmentsCount(0);
      return;
    }

    const countVal = parseInt(raw, 10);
    if (!isNaN(countVal)) {
      setInstallmentsCount(countVal);

      if (countVal >= 1) {
        if (percentStr && totalProposal > 0) {
          const p = parseFloat(percentStr);
          if (!isNaN(p) && p > 0) {
            const totalGroupVal = (p / 100) * totalProposal;
            const valPerInst = totalGroupVal / countVal;
            setValueStr(formatBRL(valPerInst));
            onUpdateItem({ ...item, installmentsCount: countVal, value: valPerInst });
            return;
          }
        }
        onUpdateItem({ ...item, installmentsCount: countVal });
      }
    }
  };

  const handleInstallmentsBlur = () => {
    if (!installmentsCount || installmentsCount < 1) {
      setInstallmentsCount(1);
      onUpdateItem({ ...item, installmentsCount: 1 });
    }
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



  return (
    <div 
      className="payment-list-item animate-fade-in"
      style={{
        background: 'rgb(0, 36, 30)',
        border: 'none',
        borderRadius: '18px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {/* Botão Excluir (X) no Canto Superior Direito */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          title="Excluir pagamento"
          aria-label="Excluir pagamento"
          style={{
            background: '#97FF66',
            border: 'none',
            color: 'rgb(0, 36, 30)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Se for a categoria ENTRADA */}
      {item.category === 'entrada' ? (
        <>
          {/* LINHA 1 (Entrada): Categoria + Modalidade Entrada */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <select 
                className="form-select" 
                value={entryType} 
                onChange={(e) => handleEntryTypeChange(e.target.value as EntryType)}
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
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
              <label className="form-label">Percentual (%)</label>
              <input
                ref={percentInputRef}
                type="text"
                inputMode="decimal"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 3 (Entrada): Vencimento */}
          <div className="form-group">
            <label className="form-label">Vencimento</label>
            <DateInput
              className="form-input"
              value={startDate}
              onChange={handleDateChange}
              placeholder="dd/mm/aaaa"
              style={{ fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: '16px', padding: '0.55rem 0.75rem' }}
              disabled={isBlocked}
            />
          </div>
        </>
      ) : item.category === 'parcela_intermediaria' ? (
        <>
          {/* INTERMEDIÁRIAS LAYOUT */}
          {/* LINHA 1: Categoria + Recorrência */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recorrência</label>
              <select 
                className="form-select" 
                value={recurrence} 
                onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceType)}
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
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
              <label className="form-label">Parcelas</label>
              <input
                type="number"
                inputMode="numeric"
                className="form-input"
                value={installmentsCount || ''}
                min={1}
                max={140}
                onChange={handleInstallmentsChange}
                onBlur={handleInstallmentsBlur}
                placeholder="1"
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Percentual Total (%)</label>
              <input
                ref={percentInputRef}
                type="text"
                inputMode="decimal"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 3: Valor Parcela (R$) + Vencimento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Valor Parcela (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primeiro Vencimento</label>
              <DateInput
                className="form-input"
                value={startDate}
                onChange={handleDateChange}
                placeholder="dd/mm/aaaa"
                style={{ fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sinal e Chaves */}
          {/* LINHA 1: Categoria + Percentual (%) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-select" 
                value={item.category} 
                onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                disabled={isBlocked}
                style={{ fontSize: '16px', padding: '0.55rem 0.75rem' }}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Percentual (%)</label>
              <input
                ref={percentInputRef}
                type="text"
                inputMode="decimal"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                onFocus={setCursorBeforePercent}
                onClick={setCursorBeforePercent}
                onKeyUp={setCursorBeforePercent}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>
          </div>

          {/* LINHA 2: Valor (R$) + Data de Vencimento / Entrega */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: '16px', padding: '0.55rem 0.75rem' }}
                disabled={isBlocked}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vencimento</label>
              {item.category === 'chaves' ? (
                <div style={{ width: '100%', fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)', color: 'var(--color-primary)', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Key size={14} />
                  <span>{keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Na Entrega'}</span>
                </div>
              ) : (
                <DateInput
                  className="form-input"
                  value={startDate}
                  onChange={handleDateChange}
                  placeholder="dd/mm/aaaa"
                  style={{ fontWeight: 600, cursor: isBlocked ? 'not-allowed' : 'pointer', fontSize: '16px', padding: '0.55rem 0.75rem' }}
                  disabled={isBlocked}
                />
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentItems,
  setPaymentItems,
  keyDeliveryDate,
  totalProposal,
  step2Warning,
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

  useEffect(() => {
    if (!isBlocked && paymentItems.length === 0) {
      setPaymentItems([{
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: 'sinal',
        description: 'Sinal de Reserva',
        value: 0,
        installmentsCount: 1,
        startDate: new Date().toISOString().split('T')[0],
      }]);
    }
  }, [isBlocked, paymentItems.length]);

  const handleUpdateItem = (updatedItem: PaymentItem) => {
    setPaymentItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleRemoveItem = (id: string) => {
    setPaymentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * (item.installmentsCount || 1)), 0);
  const launchedPercent = totalProposal > 0 ? (totalItemsSum / totalProposal) * 100 : 0;
  const roundedLaunchedPercent = Math.round(launchedPercent * 100) / 100;
  const formattedLaunchedPercent = Number.isInteger(roundedLaunchedPercent)
    ? `${roundedLaunchedPercent}%`
    : `${roundedLaunchedPercent.toFixed(2)}%`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Botão de Adicionar Pagamento + Subtotal no Topo */}
      {!isBlocked && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', color: '#DBFFC9', letterSpacing: '0.02em' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>SUBTOTAL</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{formatBRL(totalItemsSum)} ({formattedLaunchedPercent})</span>
          </div>

          <button
            type="button"
            onClick={handleAddPaymentRow}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            ADICIONAR
          </button>
        </div>
      )}

      {/* Banner de Aviso de Validação (Valor excede ao total / Valor inferior ao total) */}
      {!isBlocked && step2Warning && (
        <div className="animate-fade-in" style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#f87171', 
          background: 'rgba(239, 68, 68, 0.12)', 
          padding: '0.85rem 1.1rem', 
          borderRadius: '15px', 
          border: '1px solid rgba(239, 68, 68, 0.4)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.6rem',
          margin: '0 0.5rem'
        }}>
          <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
          <span>{step2Warning}</span>
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
          borderRadius: '15px', 
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
