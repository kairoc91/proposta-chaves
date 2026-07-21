import React from 'react';
import { formatBRL, parseBRLString } from '../../utils/formatters';
import { Calendar, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

interface ConfigFormProps {
  totalProposal: number;
  setTotalProposal: (val: number) => void;
  keyDeliveryDate: string;
  setKeyDeliveryDate: (val: string) => void;
  includeKeysInPercent: boolean;
  setIncludeKeysInPercent: (val: boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  totalProposal,
  setTotalProposal,
  keyDeliveryDate,
  setKeyDeliveryDate,
  includeKeysInPercent,
  setIncludeKeysInPercent,
  isExpanded,
  onToggle,
}) => {
  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericVal = parseBRLString(rawVal);
    setTotalProposal(numericVal);
  };

  const formattedProposal = totalProposal > 0 ? formatBRL(totalProposal) : '';

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
          <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            PREÇO E DATA DE ENTREGA
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {totalProposal > 0 && !isExpanded && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(214, 255, 0, 0.1)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
              {formatBRL(totalProposal)}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>
      
      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
          <div className="grid-2">
            {/* Valor Total da Proposta */}
            <div className="form-group">
              <div className="currency-input-wrapper">
                <input
                  id="total-proposal-input"
                  type="text"
                  className="form-input"
                  value={formattedProposal}
                  onChange={handleProposalChange}
                  placeholder="Valor Total da Proposta (R$ 0,00)"
                  style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Data de Entrega das Chaves com Calendário */}
            <div className="form-group">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar 
                  size={18} 
                  style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
                />
                <input
                  id="key-delivery-date-input"
                  type="date"
                  className="form-input"
                  value={keyDeliveryDate}
                  onChange={(e) => setKeyDeliveryDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker?.();
                    } catch {}
                  }}
                  style={{ paddingLeft: '2.5rem', fontWeight: 500, cursor: 'pointer' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox para incluir valor das chaves no percentual */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={includeKeysInPercent}
                onChange={(e) => setIncludeKeysInPercent(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', width: '17px', height: '17px', cursor: 'pointer' }}
              />
              <span>Incluir valor do saldo de chaves no cálculo do percentual até a entrega</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
