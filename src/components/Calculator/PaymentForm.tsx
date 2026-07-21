import React, { useState, useEffect } from 'react';
import type { PaymentItem, PaymentCategory, EntryType, RecurrenceType } from '../../utils/calculatorEngine';
import { formatBRL, parseBRLString, formatDateBR } from '../../utils/formatters';
import { Plus, Coins, Key, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentFormProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  keyDeliveryDate: string;
  totalProposal: number;
  isExpanded: boolean;
  onToggle: () => void;
  onItemAdded?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentItems,
  setPaymentItems,
  keyDeliveryDate,
  totalProposal,
  isExpanded,
  onToggle,
  onItemAdded,
}) => {
  // Estado do formulário de criação
  const [category, setCategory] = useState<PaymentCategory>('sinal');
  const [description, setDescription] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [percentStr, setPercentStr] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('dinheiro');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('mensal');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [startDate, setStartDate] = useState('');

  // Estados de erro/validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar descrição padrão com base na categoria e configurações
  useEffect(() => {
    if (category === 'sinal') {
      setDescription('Sinal de Reserva');
    } else if (category === 'entrada') {
      const entryLabels: Record<EntryType, string> = {
        dinheiro: 'Dinheiro',
        imovel: 'Dação - Imóvel',
        veiculo: 'Dação - Veículo',
        servico: 'Dação - Serviço',
        outros: 'Dação - Outro Bem',
      };
      setDescription(`Entrada em ${entryLabels[entryType]}`);
    } else if (category === 'parcela_intermediaria') {
      const recLabels: Record<RecurrenceType, string> = {
        mensal: 'Mensal',
        trimestral: 'Trimestral',
        semestral: 'Semestral',
        anual: 'Anual',
      };
      setDescription(`Intermediárias ${recLabels[recurrence]}s`);
    } else if (category === 'chaves') {
      setDescription('Saldo de Chaves (À Vista)');
      setInstallmentsCount(1);
    }
  }, [category, entryType, recurrence]);

  // Recalcular R$ ou % ao alterar quantidade de parcelas se o % estiver preenchido
  const handleInstallmentsChange = (countVal: number) => {
    setInstallmentsCount(countVal);
    if (percentStr && totalProposal > 0) {
      const p = parseFloat(percentStr);
      if (!isNaN(p) && p > 0) {
        const count = category === 'parcela_intermediaria' ? Math.max(1, countVal) : 1;
        const totalGroupVal = (p / 100) * totalProposal;
        const valPerInst = totalGroupVal / count;
        setValueStr(formatBRL(valPerInst));
      }
    }
  };

  // Quando o usuário digita o percentual (%)
  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPercentStr(raw);

    const p = parseFloat(raw);
    if (isNaN(p) || p <= 0) {
      setValueStr('');
      return;
    }

    if (totalProposal > 0) {
      const count = category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const totalGroupVal = (p / 100) * totalProposal;
      const valPerInst = totalGroupVal / count;
      setValueStr(formatBRL(valPerInst));
    }
  };

  // Quando o usuário digita o valor em R$
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseBRLString(raw);
    setValueStr(numeric > 0 ? formatBRL(numeric) : '');

    if (numeric > 0 && totalProposal > 0) {
      const count = category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
      const totalGroupVal = numeric * count;
      const p = (totalGroupVal / totalProposal) * 100;
      setPercentStr(p.toFixed(2));
    } else if (numeric === 0) {
      setPercentStr('');
    }
  };

  // Sincroniza quando o valor total da proposta muda
  useEffect(() => {
    if (percentStr && totalProposal > 0) {
      const p = parseFloat(percentStr);
      if (!isNaN(p) && p > 0) {
        const count = category === 'parcela_intermediaria' ? Math.max(1, installmentsCount) : 1;
        const totalGroupVal = (p / 100) * totalProposal;
        const valPerInst = totalGroupVal / count;
        setValueStr(formatBRL(valPerInst));
      }
    }
  }, [totalProposal]);

  // Submissão do item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    const numericValue = parseBRLString(valueStr);
    
    if (numericValue <= 0) {
      newErrors.value = 'Informe um valor ou percentual maior que 0';
    }
    
    if (category !== 'chaves' && !startDate) {
      newErrors.startDate = 'Informe uma data de vencimento/entrega';
    }

    if (category === 'parcela_intermediaria') {
      if (installmentsCount < 1 || installmentsCount > 140) {
        newErrors.installmentsCount = 'Quantidade deve ser entre 1 e 140 parcelas';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // A data das chaves é sempre igual a data de entrega do empreendimento
    const finalStartDate = category === 'chaves' 
      ? (keyDeliveryDate || new Date().toISOString().split('T')[0]) 
      : startDate;

    // Criar o objeto de pagamento
    const newItem: PaymentItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      description: description.trim(),
      value: numericValue,
      startDate: finalStartDate,
      installmentsCount: category === 'parcela_intermediaria' ? installmentsCount : 1,
      entryType: category === 'entrada' ? entryType : undefined,
      recurrence: category === 'parcela_intermediaria' ? recurrence : undefined,
    };

    setPaymentItems((prev) => [...prev, newItem]);
    
    // Limpar campos
    setValueStr('');
    setPercentStr('');
    setStartDate('');
    setErrors({});

    if (onItemAdded) {
      onItemAdded();
    }
  };

  const parsedNumericVal = parseBRLString(valueStr);

  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * item.installmentsCount), 0);
  const launchedPercent = totalProposal > 0 ? (totalItemsSum / totalProposal) * 100 : 0;
  const unlaunchedPercent = Math.max(0, 100 - launchedPercent);

  const formatPercentSimple = (val: number): string => {
    const rounded = Math.round(val * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '0', marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Cabeçalho Clicável do Accordion */}
      <div 
        onClick={onToggle}
        style={{ 
          padding: '1.25rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          background: isExpanded ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
          transition: 'background 0.2s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Coins size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            PAGAMENTOS
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Percentual Lançado / Percentual Restante Não Lançado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-success)', background: 'rgba(34, 197, 94, 0.12)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }} title="Percentual Lançado">
              {formatPercentSimple(launchedPercent)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/</span>
            <span style={{ color: 'var(--color-warning)', background: 'rgba(188, 188, 188, 0.12)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }} title="Percentual Não Lançado">
              {formatPercentSimple(unlaunchedPercent)}
            </span>
          </div>

          {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>

      {/* Conteúdo Expansível (Formulário de Criação) */}
      {isExpanded && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Categoria */}
            <div className="form-group">
              <select 
                className="form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value as PaymentCategory)}
              >
                <option value="sinal">Sinal</option>
                <option value="entrada">Entrada</option>
                <option value="parcela_intermediaria">Intermediárias</option>
                <option value="chaves">Chaves</option>
              </select>
            </div>

            {/* Sub-configuração para Entrada */}
            {category === 'entrada' && (
              <div className="form-group animate-fade-in">
                <select 
                  className="form-select" 
                  value={entryType} 
                  onChange={(e) => setEntryType(e.target.value as EntryType)}
                >
                  <option value="dinheiro">Entrada em Dinheiro (TED/Pix)</option>
                  <option value="imovel">Entrada via Dação de Imóvel</option>
                  <option value="veiculo">Entrada via Dação de Veículo</option>
                  <option value="servico">Entrada via Dação de Serviço</option>
                  <option value="outros">Entrada via Dação de Outro Bem</option>
                </select>
              </div>
            )}

            {/* Aviso / Notificação para Chaves */}
            {category === 'chaves' && (
              <div className="form-group animate-fade-in">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Vencimento das chaves: <strong>{keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Igual à Data de Entrega das Chaves'}</strong></span>
                </div>
              </div>
            )}

            {/* Recorrência e Qtd Parcelas (Apenas para Intermediárias) */}
            {category === 'parcela_intermediaria' && (
              <div className="grid-2 animate-fade-in">
                <div className="form-group">
                  <select 
                    className="form-select" 
                    value={recurrence} 
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    className={`form-input ${errors.installmentsCount ? 'error' : ''}`}
                    value={installmentsCount || ''}
                    min={1}
                    max={140}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleInstallmentsChange(isNaN(val) ? 0 : val);
                    }}
                    placeholder="Parcelas (1 a 140)"
                  />
                  {errors.installmentsCount && <span className="form-error">{errors.installmentsCount}</span>}
                </div>
              </div>
            )}

            {/* Valor % e Valor R$ em paralelo */}
            <div className="grid-2">
              {/* Campo % do imóvel */}
              <div className="form-group">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    className="form-input"
                    value={percentStr}
                    onChange={handlePercentChange}
                    placeholder="Percentual (%)"
                    style={{ fontWeight: 600, paddingRight: '2rem' }}
                  />
                  <span style={{ position: 'absolute', right: '1rem', color: 'var(--text-muted)', fontWeight: 600, pointerEvents: 'none' }}>
                    %
                  </span>
                </div>
              </div>

              {/* Campo R$ (por parcela ou total) */}
              <div className="form-group">
                <div className="currency-input-wrapper">
                  <input
                    type="text"
                    className={`form-input ${errors.value ? 'error' : ''}`}
                    value={valueStr}
                    onChange={handleValueChange}
                    placeholder={category === 'parcela_intermediaria'
                      ? 'Valor parcela (R$ 0)' 
                      : 'Valor (R$ 0)'}
                    style={{ fontWeight: 600 }}
                  />
                </div>
                {errors.value && <span className="form-error">{errors.value}</span>}
              </div>
            </div>

            {/* Resumo do Cálculo Dinâmico */}
            {parsedNumericVal > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.5rem', paddingLeft: '0.5rem' }}>
                {category === 'parcela_intermediaria' ? (
                  <>
                    {installmentsCount}x de <strong>{formatBRL(parsedNumericVal)}</strong> = Total de <strong>{formatBRL(parsedNumericVal * installmentsCount)}</strong>
                    {totalProposal > 0 && (
                      <> (<strong>{(((parsedNumericVal * installmentsCount) / totalProposal) * 100).toFixed(2)}%</strong> do imóvel)</>
                    )}
                  </>
                ) : (
                  <>
                    Valor: <strong>{formatBRL(parsedNumericVal)}</strong>
                    {totalProposal > 0 && (
                      <> (<strong>{((parsedNumericVal / totalProposal) * 100).toFixed(2)}%</strong> do imóvel)</>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Data de Vencimento / Entrega com Calendário (Apenas se não for chaves) */}
            {category !== 'chaves' && (
              <div className="form-group">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <CalendarDays 
                    size={18} 
                    style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
                  />
                  <input
                    type="date"
                    className={`form-input ${errors.startDate ? 'error' : ''}`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    style={{ paddingLeft: '2.5rem', cursor: 'pointer' }}
                    required
                  />
                </div>
                {errors.startDate && <span className="form-error">{errors.startDate}</span>}
              </div>
            )}

            {/* Botão de Submeter */}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={18} />
              ADICIONAR ITEM
            </button>

          </form>
        </div>
      )}
    </div>
  );
};
