import React, { useState, useEffect } from 'react';
import type { PaymentItem, PaymentCategory, RecurrenceType } from '../../utils/calculatorEngine';
import { formatBRL, parseBRLString } from '../../utils/formatters';
import { Trash2, FileText, CalendarDays } from 'lucide-react';

interface ConfiguredItemsListProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  totalProposal: number;
}

interface InlineItemRowProps {
  item: PaymentItem;
  totalProposal: number;
  onUpdateItem: (updatedItem: PaymentItem) => void;
  onRemoveItem: (id: string) => void;
  badgeStyle: React.CSSProperties;
  categoryLabel: string;
}

const InlineItemRow: React.FC<InlineItemRowProps> = ({
  item,
  totalProposal,
  onUpdateItem,
  onRemoveItem,
  badgeStyle,
  categoryLabel,
}) => {
  const [valueStr, setValueStr] = useState(item.value > 0 ? formatBRL(item.value) : '');
  const [percentStr, setPercentStr] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState(item.installmentsCount || 1);
  const [startDate, setStartDate] = useState(item.startDate || '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(item.recurrence || 'mensal');

  // Sincronizar estados locais quando props mudarem externamente
  useEffect(() => {
    setValueStr(item.value > 0 ? formatBRL(item.value) : '');
    setInstallmentsCount(item.installmentsCount || 1);
    setStartDate(item.startDate || '');
    if (item.recurrence) setRecurrence(item.recurrence);

    if (totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, item.installmentsCount) : 1;
      const totalGroupVal = item.value * count;
      const p = (totalGroupVal / totalProposal) * 100;
      setPercentStr(p > 0 ? p.toFixed(2) : '');
    } else {
      setPercentStr('');
    }
  }, [item.value, item.installmentsCount, item.startDate, item.recurrence, totalProposal]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseBRLString(raw);
    setValueStr(numeric > 0 ? formatBRL(numeric) : '');

    if (numeric > 0 && totalProposal > 0) {
      const count = item.category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const totalGroupVal = numeric * count;
      const p = (totalGroupVal / totalProposal) * 100;
      setPercentStr(p.toFixed(2));
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
    onUpdateItem({ ...item, recurrence: newRec });
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
      className="payment-list-item"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      {/* Linha Superior: Badge + Nome do Lançamento + Botão Excluir */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0.25rem 0.6rem', 
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            ...badgeStyle
          }}>
            {categoryLabel}
          </span>

          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {item.description}
          </span>
        </div>

        <button
          onClick={() => onRemoveItem(item.id)}
          className="btn btn-danger btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
          title="Excluir item de pagamento"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Linha Intermediária: Campos de Edição Direta de Valores, Datas e Recorrência */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '0.6rem', 
        alignItems: 'center' 
      }}>
        {/* Input Percentual % */}
        <div className="form-group" style={{ gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PERCENTUAL</label>
          <input
            type="text"
            className="form-input"
            value={percentStr ? `${percentStr}%` : ''}
            onChange={handlePercentChange}
            placeholder="0%"
            style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem' }}
          />
        </div>

        {/* Input Valor R$ (por parcela) */}
        <div className="form-group" style={{ gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {item.category === 'parcela_intermediaria' ? 'VALOR PARCELA' : 'VALOR (R$)'}
          </label>
          <input
            type="text"
            className="form-input"
            value={valueStr}
            onChange={handleValueChange}
            placeholder="R$ 0,00"
            style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem' }}
          />
        </div>

        {/* Quantidade de Parcelas (apenas se for intermediária) */}
        {item.category === 'parcela_intermediaria' && (
          <div className="form-group" style={{ gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>QTD PARCELAS</label>
            <input
              type="number"
              className="form-input"
              value={installmentsCount || ''}
              min={1}
              max={140}
              onChange={handleInstallmentsChange}
              placeholder="Qtd (1)"
              style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem' }}
            />
          </div>
        )}

        {/* Recorrência (apenas se for intermediária) */}
        {item.category === 'parcela_intermediaria' && (
          <div className="form-group" style={{ gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECORRÊNCIA</label>
            <select
              className="form-select"
              value={recurrence}
              onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceType)}
              style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem' }}
            >
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        )}

        {/* Data de Vencimento / Início (Apenas se não for chaves) */}
        {item.category !== 'chaves' && (
          <div className="form-group" style={{ gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>VENCIMENTO / INÍCIO</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <CalendarDays 
                size={14} 
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
                style={{ fontSize: '0.85rem', fontWeight: 500, paddingLeft: '2rem', paddingRight: '0.5rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Linha Inferior: Subtotal do Item e % do Imóvel */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '0.5rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.8rem'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {item.installmentsCount > 1 ? (
            <>{item.installmentsCount}x de <strong>{formatBRL(item.value)}</strong> ({item.recurrence})</>
          ) : (
            <>Pagamento Único</>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Subtotal: {formatBRL(itemTotal)}
          </span>
          {itemPercent > 0 && (
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'var(--color-success-bg)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-success-border)', fontSize: '0.75rem' }}>
              {itemPercent.toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConfiguredItemsList: React.FC<ConfiguredItemsListProps> = ({
  paymentItems,
  setPaymentItems,
  totalProposal,
}) => {
  const handleRemoveItem = (id: string) => {
    setPaymentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (updatedItem: PaymentItem) => {
    setPaymentItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const getCategoryLabel = (cat: PaymentCategory) => {
    switch (cat) {
      case 'sinal': return 'Sinal';
      case 'entrada': return 'Entrada';
      case 'parcela_intermediaria': return 'Intermediárias';
      case 'chaves': return 'Chaves';
    }
  };

  const getCategoryBadgeStyle = (cat: PaymentCategory) => {
    switch (cat) {
      case 'sinal':
        return {
          color: 'var(--color-pantone-9580c)',
          background: 'rgba(219, 255, 201, 0.10)',
          border: '1px solid rgba(219, 255, 201, 0.25)',
        };
      case 'entrada':
        return {
          color: 'var(--color-primary)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
        };
      case 'parcela_intermediaria':
        return {
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
      case 'chaves':
        return {
          color: 'var(--color-primary)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
        };
    }
  };

  const isSectionFilled = paymentItems.length > 0;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '0', marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Cabeçalho Fixo do Painel */}
      <div 
        style={{ 
          padding: '1.25rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(255, 255, 255, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: isSectionFilled ? 'var(--color-primary)' : 'var(--text-secondary)', 
            boxShadow: isSectionFilled ? '0 0 10px var(--color-primary-glow), 0 0 4px var(--color-primary)' : 'none',
            display: 'inline-block',
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            LANÇAMENTOS
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
            {paymentItems.length} {paymentItems.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {/* Conteúdo Fixo (Sempre Aberto) */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
        {paymentItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem', padding: '2.5rem 0' }}>
            <FileText size={48} strokeWidth={1} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Nenhum pagamento adicionado ainda</p>
              <p style={{ fontSize: '0.8rem' }}>Utilize o formulário "PAGAMENTOS" acima para adicionar itens de pagamento à proposta.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paymentItems.map((item) => (
              <InlineItemRow
                key={item.id}
                item={item}
                totalProposal={totalProposal}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                badgeStyle={getCategoryBadgeStyle(item.category)}
                categoryLabel={getCategoryLabel(item.category)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
