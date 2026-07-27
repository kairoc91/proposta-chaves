import React, { useState } from 'react';
import type { PaymentItem, PaymentCategory, EntryType, RecurrenceType } from '../../utils/calculatorEngine';
import { formatBRL, parseBRLString, formatMonthYearBR } from '../../utils/formatters';
import { Plus, Trash2, Pencil, AlertCircle, AlertTriangle, X, Sparkles } from 'lucide-react';
import { MonthYearInput } from './MonthYearInput';

interface PaymentFormProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  keyDeliveryDate: string;
  totalProposal: number;
  step2Warning?: string | null;
  onWizardStateChange?: (isOpen: boolean) => void;
}

interface PaymentItemCardProps {
  item: PaymentItem;
  totalProposal: number;
  keyDeliveryDate: string;
  isBlocked: boolean;
  onEditItem: (item: PaymentItem) => void;
  onRemoveItem: (id: string) => void;
}

const PaymentItemCard: React.FC<PaymentItemCardProps> = ({
  item,
  totalProposal,
  keyDeliveryDate,
  isBlocked,
  onEditItem,
  onRemoveItem,
}) => {
  const count = item.category === 'parcela_intermediaria' ? Math.max(1, item.installmentsCount || 1) : 1;
  const totalGroupVal = item.value * count;
  const percent = totalProposal > 0 ? (totalGroupVal / totalProposal) * 100 : 0;
  const roundedPercent = Math.round(percent * 100) / 100;
  const formattedPercent = roundedPercent > 0 ? `${roundedPercent}%` : '0%';

  const recLabels: Record<RecurrenceType, string> = {
    mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual'
  };

  const catHeaderTitle = item.category === 'sinal'
    ? 'Sinal de Reserva'
    : item.category === 'entrada'
    ? item.description || 'Entrada'
    : item.category === 'parcela_intermediaria'
    ? `Parcela ${item.recurrence ? recLabels[item.recurrence] : 'Mensal'}`
    : 'Saldo de Chaves';

  const formattedDate = item.category === 'chaves'
    ? (keyDeliveryDate ? formatMonthYearBR(keyDeliveryDate) : 'Entrega')
    : (item.startDate ? formatMonthYearBR(item.startDate) : '-');

  return (
    <div className="animate-fade-in" style={{
      background: 'rgba(0, 36, 30, 0.9)',
      border: '1px solid rgba(219, 255, 201, 0.22)',
      borderRadius: '16px',
      padding: '0.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      transition: 'all 0.2s ease',
    }}>
      {/* Header do Card: Tipo de Lançamento + Botões de Ação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(219, 255, 201, 0.1)', paddingBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#DBFFC9',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            {catHeaderTitle}
          </span>
          {count > 1 && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.45rem',
              borderRadius: '8px',
              background: 'rgba(219, 255, 201, 0.15)',
              color: '#DBFFC9',
            }}>
              {count}x
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => onEditItem(item)}
            disabled={isBlocked}
            title="Editar lançamento"
            aria-label="Editar lançamento"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#DBFFC9',
              cursor: isBlocked ? 'not-allowed' : 'pointer',
              padding: '0.25rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isBlocked ? 0.4 : 1,
            }}
          >
            <Pencil size={15} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            disabled={isBlocked}
            title="Excluir lançamento"
            aria-label="Excluir lançamento"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#DBFFC9',
              cursor: isBlocked ? 'not-allowed' : 'pointer',
              padding: '0.25rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isBlocked ? 0.4 : 1,
            }}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Corpo do Card: Informações compactas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#DBFFC9', paddingTop: '0.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(219, 255, 201, 0.6)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>% Proposta</span>
            <span style={{ fontWeight: 800 }}>{formattedPercent}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(219, 255, 201, 0.6)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Início / Data</span>
            <span style={{ fontWeight: 700 }}>{formattedDate}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(219, 255, 201, 0.6)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Prazo</span>
            <span style={{ fontWeight: 700 }}>{item.category === 'parcela_intermediaria' && item.recurrence ? recLabels[item.recurrence] : 'Único'}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(219, 255, 201, 0.6)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
            {count > 1 ? 'Valor / Parcela' : 'Valor'}
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
            {formatBRL(item.value)}
          </span>
          {count > 1 && (
            <span style={{ fontSize: '0.68rem', color: 'rgba(219, 255, 201, 0.7)', display: 'block', fontWeight: 600 }}>
              (Total {formatBRL(totalGroupVal)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ===================================================================
 * COMPONENTE: INLINE PAYMENT WIZARD (CARD ASSISTIDO PASSO A PASSO)
 * =================================================================== */
interface InlinePaymentWizardProps {
  totalProposal: number;
  keyDeliveryDate: string;
  existingItemsSum: number;
  itemToEdit?: PaymentItem | null;
  onSaveComplete: (newItem: PaymentItem) => void;
  onCancel: () => void;
}

const InlinePaymentWizard: React.FC<InlinePaymentWizardProps> = ({
  totalProposal,
  keyDeliveryDate,
  existingItemsSum,
  itemToEdit,
  onSaveComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(itemToEdit ? 2 : 1);
  const [category, setCategory] = useState<PaymentCategory | null>(itemToEdit?.category || null);
  const [entryType, setEntryType] = useState<EntryType>(itemToEdit?.entryType || 'dinheiro');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(itemToEdit?.recurrence || 'mensal');
  const [installmentsCount, setInstallmentsCount] = useState<number | ''>(itemToEdit?.installmentsCount || 12);
  const [startDate, setStartDate] = useState<string>(itemToEdit?.startDate || new Date().toISOString().split('T')[0]);

  const [percentStr, setPercentStr] = useState<string>(() => {
    if (itemToEdit && totalProposal > 0) {
      const count = itemToEdit.category === 'parcela_intermediaria' ? Math.max(1, itemToEdit.installmentsCount) : 1;
      const totalG = itemToEdit.value * count;
      const p = (totalG / totalProposal) * 100;
      const rounded = Math.round(p * 100) / 100;
      return rounded > 0 ? String(rounded) : '';
    }
    return '';
  });

  const [valueStr, setValueStr] = useState<string>(
    itemToEdit && itemToEdit.value > 0 ? formatBRL(itemToEdit.value) : ''
  );

  const currentEditingVal = itemToEdit ? itemToEdit.value * (itemToEdit.installmentsCount || 1) : 0;
  const netExistingSum = Math.max(0, existingItemsSum - currentEditingVal);
  const remainingValue = Math.max(0, totalProposal - netExistingSum);
  const remainingPercent = totalProposal > 0 ? (remainingValue / totalProposal) * 100 : 0;

  // Ajustar defaults ao trocar categoria
  const handleSelectCategory = (cat: PaymentCategory) => {
    setCategory(cat);
    if (cat === 'sinal' || cat === 'chaves') {
      setInstallmentsCount(1);
    } else if (cat === 'parcela_intermediaria') {
      if (typeof installmentsCount !== 'number' || installmentsCount <= 1) setInstallmentsCount(12);
    }
    setStep(2);
  };

  const actualCount = category === 'parcela_intermediaria' ? Math.max(1, typeof installmentsCount === 'number' ? installmentsCount : 1) : 1;

  // Preencher automaticamente com todo o saldo restante
  const handleFillRemaining = () => {
    if (remainingValue <= 0 || totalProposal <= 0) return;
    const roundedP = Math.round(remainingPercent * 100) / 100;
    setPercentStr(String(roundedP));
    const valPerInst = remainingValue / actualCount;
    setValueStr(formatBRL(valPerInst));
  };

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace('%', '').replace(',', '.').trim();
    raw = raw.replace(/[^\d.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');

    let p = parseFloat(raw);
    if (!isNaN(p) && p > 100) p = 100;

    setPercentStr(raw);

    if (!isNaN(p) && p > 0 && totalProposal > 0) {
      const totalGroupVal = (p / 100) * totalProposal;
      const valPerInst = totalGroupVal / actualCount;
      setValueStr(formatBRL(valPerInst));
    } else if (raw === '') {
      setValueStr('');
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseBRLString(raw);
    setValueStr(numeric > 0 ? formatBRL(numeric) : '');

    if (numeric > 0 && totalProposal > 0) {
      const totalGroupVal = numeric * actualCount;
      const p = (totalGroupVal / totalProposal) * 100;
      const rounded = Math.round(p * 100) / 100;
      setPercentStr(rounded > 0 ? String(rounded) : '');
    } else {
      setPercentStr('');
    }
  };

  const handleConfirm = () => {
    const numericVal = parseBRLString(valueStr);
    let description = '';

    if (category === 'sinal') {
      description = 'Sinal de Reserva';
    } else if (category === 'entrada') {
      const entryLabels: Record<EntryType, string> = {
        dinheiro: 'Dinheiro', imovel: 'Imóvel', veiculo: 'Veículo', servico: 'Serviço', outros: 'Outro'
      };
      description = `Entrada - ${entryLabels[entryType] || 'Dinheiro'}`;
    } else if (category === 'parcela_intermediaria') {
      const recLabels: Record<RecurrenceType, string> = {
        mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual'
      };
      description = `Parcela ${recLabels[recurrence]}`;
    } else if (category === 'chaves') {
      description = 'Saldo de Chaves (À Vista)';
    }

    const activeCategory: PaymentCategory = category || 'sinal';
    const newItem: PaymentItem = {
      id: itemToEdit ? itemToEdit.id : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: activeCategory,
      description,
      value: numericVal,
      installmentsCount: actualCount,
      entryType: activeCategory === 'entrada' ? entryType : undefined,
      recurrence: activeCategory === 'parcela_intermediaria' ? recurrence : undefined,
      startDate: activeCategory === 'chaves' ? (keyDeliveryDate || startDate) : startDate,
    };

    onSaveComplete(newItem);
  };

  const wizardBtnStyle: React.CSSProperties = {
    backgroundColor: '#DBFFC9',
    color: '#00241E',
    border: '1px solid #DBFFC9',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
    padding: '0.45rem 0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    userSelect: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="animate-fade-in" style={{
      background: 'linear-gradient(135deg, rgba(0, 48, 40, 0.95), rgba(0, 30, 25, 0.98))',
      border: '1px solid rgba(219, 255, 201, 0.4)',
      borderRadius: '20px',
      padding: '1.25rem',
      margin: '0.5rem 0 1.25rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Cabeçalho do Wizard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(219, 255, 201, 0.15)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DBFFC9' }}>
          <Sparkles size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {itemToEdit ? 'EDITAR LANÇAMENTO' : 'ASSISTENTE DE LANÇAMENTO'}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'transparent', border: 'none', color: 'rgba(219, 255, 201, 0.7)', cursor: 'pointer', padding: '0.2rem' }}
          title="Cancelar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Indicador visual dos Passos */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? '#DBFFC9' : 'rgba(219, 255, 201, 0.15)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* ================= PASSO 1: SELEÇÃO DE TIPO ================= */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(219, 255, 201, 0.9)', fontWeight: 600 }}>
            Qual tipo de lançamento deseja adicionar?
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {[
              { id: 'sinal', label: 'Sinal de Reserva', badge: 'S' },
              { id: 'entrada', label: 'Entrada', badge: 'E' },
              { id: 'parcela_intermediaria', label: 'Parcelas', badge: 'P' },
              { id: 'chaves', label: 'Saldo de Chaves', badge: 'C' },
            ].map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id as PaymentCategory)}
                  style={{
                    background: isSelected ? 'rgba(219, 255, 201, 0.15)' : 'rgba(219, 255, 201, 0.04)',
                    border: isSelected ? '1px solid #DBFFC9' : '1px solid rgba(219, 255, 201, 0.15)',
                    borderRadius: '14px',
                    padding: '0.85rem 0.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    color: '#DBFFC9',
                  }}
                  className="wizard-type-card"
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isSelected ? '#DBFFC9' : 'rgba(219, 255, 201, 0.15)',
                    color: isSelected ? '#00241E' : '#DBFFC9',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {cat.badge}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PASSO 2: PRAZO E CONDIÇÕES ================= */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(219, 255, 201, 0.9)', fontWeight: 600 }}>
            Configure as condições do lançamento ({category === 'sinal' ? 'Sinal' : category === 'entrada' ? 'Entrada' : category === 'chaves' ? 'Chaves' : 'Parcelas'}):
          </span>

          {/* Opções específicas para Entrada */}
          {category === 'entrada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>Tipo de Recurso:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  { id: 'dinheiro', label: 'Dinheiro' },
                  { id: 'imovel', label: 'Imóvel' },
                  { id: 'veiculo', label: 'Veículo' },
                  { id: 'outros', label: 'Outro' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEntryType(t.id as EntryType)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: entryType === t.id ? '1px solid #DBFFC9' : '1px solid rgba(219, 255, 201, 0.2)',
                      background: entryType === t.id ? '#DBFFC9' : 'rgba(219, 255, 201, 0.05)',
                      color: entryType === t.id ? '#00241E' : '#DBFFC9',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opções específicas para Parcelas Intermediárias */}
          {category === 'parcela_intermediaria' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>Quantidade de Parcelas:</label>
                <input
                  type="number"
                  min={1}
                  max={140}
                  className="form-input"
                  value={installmentsCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setInstallmentsCount('');
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setInstallmentsCount(num);
                    }
                  }}
                  onBlur={() => {
                    if (installmentsCount === '' || installmentsCount < 1) {
                      setInstallmentsCount(1);
                    }
                  }}
                  style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}
                />
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  {[12, 24, 36, 48, 60, 84, 100, 120].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInstallmentsCount(q)}
                      style={{
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid rgba(219, 255, 201, 0.3)',
                        background: installmentsCount === q ? '#DBFFC9' : 'transparent',
                        color: installmentsCount === q ? '#00241E' : '#DBFFC9',
                        cursor: 'pointer'
                      }}
                    >
                      {q}x
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>Periodicidade:</label>
                <select
                  className="form-select"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem', color: '#DBFFC9' }}
                >
                  <option value="mensal" style={{ color: '#DBFFC9' }}>Mensal</option>
                  <option value="trimestral" style={{ color: '#DBFFC9' }}>Trimestral</option>
                  <option value="semestral" style={{ color: '#DBFFC9' }}>Semestral</option>
                  <option value="anual" style={{ color: '#DBFFC9' }}>Anual</option>
                </select>
              </div>
            </div>
          )}

          {/* Data do Primeiro Lançamento */}
          {category !== 'chaves' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '160px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>Mês/Ano de Início:</label>
              <MonthYearInput
                className="form-input"
                value={startDate}
                onChange={(d) => setStartDate(d)}
                placeholder="mm/aa"
                style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}
                isShortYear={true}
              />
            </div>
          )}

          {category === 'chaves' && (
            <div style={{ fontSize: '0.8rem', color: '#DBFFC9', background: 'rgba(219, 255, 201, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '12px' }}>
              Este valor será vinculado automaticamente à data de entrega das chaves: <strong>{keyDeliveryDate ? formatMonthYearBR(keyDeliveryDate) : 'Definida no topo'}</strong>.
            </div>
          )}

          {/* Botões do Passo 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={wizardBtnStyle}
            >
              <span>VOLTAR</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={wizardBtnStyle}
            >
              <span>AVANÇAR</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= PASSO 3: DEFINIÇÃO DE VALORES ================= */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Banner de Saldo Disponível */}
          <div style={{
            background: 'rgba(219, 255, 201, 0.08)',
            border: '1px dashed rgba(219, 255, 201, 0.3)',
            borderRadius: '12px',
            padding: '0.6rem 0.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', color: '#DBFFC9' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(219, 255, 201, 0.7)' }}>Saldo Restante da Proposta</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{formatBRL(remainingValue)}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, opacity: 0.85 }}>({remainingPercent.toFixed(2)}%)</span>
              </div>
            </div>
            {remainingValue > 0 && (
              <button
                type="button"
                onClick={handleFillRemaining}
                style={{
                  background: '#DBFFC9',
                  color: '#00241E',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                USAR RESTANTE
              </button>
            )}
          </div>

          {/* Entradas de Porcentagem e Valor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>Porcentagem (%):</label>
              <input
                type="text"
                inputMode="decimal"
                className="form-input"
                value={percentStr ? `${percentStr}%` : ''}
                onChange={handlePercentChange}
                placeholder="0%"
                style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DBFFC9' }}>
                {category === 'parcela_intermediaria' && actualCount > 1 ? 'Valor por Parcela:' : 'Valor Total:'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                value={valueStr}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Resumo Dinâmico em Tempo Real */}
          {parseBRLString(valueStr) > 0 && (
            <div style={{
              background: 'rgba(219, 255, 201, 0.05)',
              borderRadius: '12px',
              padding: '0.6rem 0.8rem',
              border: '1px solid rgba(219, 255, 201, 0.15)',
              fontSize: '0.78rem',
              color: '#DBFFC9',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <span style={{ fontWeight: 800 }}>Resumo do lançamento:</span>
              <span>
                {category === 'parcela_intermediaria'
                  ? `${actualCount}x de ${valueStr} (${recurrence}) = Total ${formatBRL(parseBRLString(valueStr) * actualCount)}`
                  : `${category === 'sinal' ? 'Sinal' : category === 'chaves' ? 'Chaves' : 'Entrada'} no valor de ${valueStr}`
                }
              </span>
            </div>
          )}

          {/* Botões do Passo 3 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={wizardBtnStyle}
            >
              <span>VOLTAR</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={parseBRLString(valueStr) <= 0}
              style={{
                ...wizardBtnStyle,
                opacity: parseBRLString(valueStr) <= 0 ? 0.45 : 1,
                cursor: parseBRLString(valueStr) <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <span>CONFIRMAR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================================================================
 * COMPONENTE PRINCIPAL: PAYMENT FORM
 * =================================================================== */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentItems,
  setPaymentItems,
  keyDeliveryDate,
  totalProposal,
  step2Warning,
  onWizardStateChange,
}) => {
  const isBlocked = !totalProposal || !keyDeliveryDate;
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PaymentItem | null>(null);

  const handleOpenWizard = () => {
    setItemToEdit(null);
    setIsWizardOpen(true);
    if (onWizardStateChange) onWizardStateChange(true);
  };

  const handleEditItem = (item: PaymentItem) => {
    setItemToEdit(item);
    setIsWizardOpen(true);
    if (onWizardStateChange) onWizardStateChange(true);
  };

  const handleSaveFromWizard = (newItem: PaymentItem) => {
    setPaymentItems((prev) => {
      const exists = prev.some(i => i.id === newItem.id);
      if (exists) {
        return prev.map(i => i.id === newItem.id ? newItem : i);
      }
      return [newItem, ...prev];
    });
    setIsWizardOpen(false);
    setItemToEdit(null);
    if (onWizardStateChange) onWizardStateChange(false);
  };

  const handleCancelWizard = () => {
    setIsWizardOpen(false);
    setItemToEdit(null);
    if (onWizardStateChange) onWizardStateChange(false);
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

          {!isWizardOpen && (
            <button
              type="button"
              onClick={handleOpenWizard}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> ADICIONAR
            </button>
          )}
        </div>
      )}

      {/* Banner de Aviso de Validação */}
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

      {/* WIZARD INLINE CARD ASSISTIDO */}
      {isWizardOpen && (
        <InlinePaymentWizard
          totalProposal={totalProposal}
          keyDeliveryDate={keyDeliveryDate}
          existingItemsSum={totalItemsSum}
          itemToEdit={itemToEdit}
          onSaveComplete={handleSaveFromWizard}
          onCancel={handleCancelWizard}
        />
      )}

      {/* Aviso discreto quando não há lançamentos */}
      {!isBlocked && paymentItems.length === 0 && !isWizardOpen && (
        <div className="animate-fade-in" style={{ 
          fontSize: '0.82rem', 
          fontWeight: 600, 
          color: 'rgba(219, 255, 201, 0.75)', 
          background: 'rgba(219, 255, 201, 0.04)', 
          border: '1px dashed rgba(219, 255, 201, 0.2)', 
          padding: '1.25rem 1rem', 
          borderRadius: '15px', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.25rem',
          margin: '0.5rem 0'
        }}>
          <span>Nenhum lançamento cadastrado.</span>
        </div>
      )}

      {/* Lista de Cards de Pagamentos */}
      {paymentItems.length > 0 && !isWizardOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {paymentItems.map((item) => (
            <PaymentItemCard
              key={item.id}
              item={item}
              totalProposal={totalProposal}
              keyDeliveryDate={keyDeliveryDate}
              isBlocked={isBlocked}
              onEditItem={handleEditItem}
              onRemoveItem={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
