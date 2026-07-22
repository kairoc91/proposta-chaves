import React, { useRef, useEffect, useState } from 'react';
import { formatBRL, parseBRLString } from '../../utils/formatters';
import { Calendar, HelpCircle, X } from 'lucide-react';

interface ConfigFormProps {
  totalProposal: number;
  setTotalProposal: (val: number) => void;
  keyDeliveryDate: string;
  setKeyDeliveryDate: (val: string) => void;
  includeKeysInPercent: boolean;
  setIncludeKeysInPercent: (val: boolean) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  totalProposal,
  setTotalProposal,
  keyDeliveryDate,
  setKeyDeliveryDate,
  includeKeysInPercent,
  setIncludeKeysInPercent,
}) => {
  const proposalInputRef = useRef<HTMLInputElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<'price' | 'date' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      proposalInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericVal = parseBRLString(rawVal);
    setTotalProposal(numericVal);
  };

  const formattedProposal = totalProposal > 0 ? formatBRL(totalProposal) : '';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 1rem' }}>
      {/* Valor Total da Proposta (Acima) */}
      <div className="form-group" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label htmlFor="total-proposal-input" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Preço Proposta
          </label>
          <button
            type="button"
            onClick={() => setActiveTooltip(activeTooltip === 'price' ? null : 'price')}
            title="Ajuda sobre Preço Proposta"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTooltip === 'price' ? 'rgb(151, 255, 102)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '12px',
              backgroundColor: activeTooltip === 'price' ? 'rgba(151, 255, 102, 0.15)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <HelpCircle size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ajuda</span>
          </button>
        </div>

        {/* Balãozinho de Ajuda do Preço */}
        {activeTooltip === 'price' && (
          <div 
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              left: '0',
              zIndex: 10,
              marginTop: '0.35rem',
              backgroundColor: 'rgb(0, 36, 30)',
              border: '1px solid rgb(151, 255, 102)',
              borderRadius: '16px',
              padding: '0.85rem 1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              color: '#ffffff',
              fontSize: '0.85rem',
              lineHeight: 1.45
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'rgb(151, 255, 102)', display: 'block', marginBottom: '0.2rem' }}>
                  Preço Proposta:
                </strong>
                Informe o valor total bruto da proposta comercial de compra do imóvel.
              </div>
              <button 
                type="button" 
                onClick={() => setActiveTooltip(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="currency-input-wrapper">
          <input
            ref={proposalInputRef}
            id="total-proposal-input"
            type="text"
            className="form-input"
            value={formattedProposal}
            onChange={handleProposalChange}
            placeholder="R$ 0,00"
            style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', padding: '1rem 1.75rem' }}
          />
        </div>
      </div>

      {/* Data de Entrega das Chaves com Calendário (Abaixo) */}
      <div className="form-group" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label htmlFor="key-delivery-date-input" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Data Entrega
          </label>
          <button
            type="button"
            onClick={() => setActiveTooltip(activeTooltip === 'date' ? null : 'date')}
            title="Ajuda sobre Data de Entrega"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTooltip === 'date' ? 'rgb(151, 255, 102)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '12px',
              backgroundColor: activeTooltip === 'date' ? 'rgba(151, 255, 102, 0.15)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <HelpCircle size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ajuda</span>
          </button>
        </div>

        {/* Balãozinho de Ajuda da Data */}
        {activeTooltip === 'date' && (
          <div 
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              left: '0',
              zIndex: 10,
              marginTop: '0.35rem',
              backgroundColor: 'rgb(0, 36, 30)',
              border: '1px solid rgb(151, 255, 102)',
              borderRadius: '16px',
              padding: '0.85rem 1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              color: '#ffffff',
              fontSize: '0.85rem',
              lineHeight: 1.45
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'rgb(151, 255, 102)', display: 'block', marginBottom: '0.2rem' }}>
                  Data de Entrega:
                </strong>
                Selecione a data prevista de entrega das chaves. Ela divide as parcelas em pagamentos ANTES e APÓS a entrega.
              </div>
              <button 
                type="button" 
                onClick={() => setActiveTooltip(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Calendar 
            size={20} 
            style={{ position: 'absolute', left: '1.15rem', color: 'var(--text-muted)', pointerEvents: 'none' }} 
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
            style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem', padding: '1rem 1.75rem 1rem 3.25rem' }}
            required
          />
        </div>
      </div>

      {/* Checkbox para incluir valor das chaves no percentual */}
      <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={includeKeysInPercent}
            onChange={(e) => setIncludeKeysInPercent(e.target.checked)}
            style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
          />
          <span>Incluir valor do saldo de chaves no cálculo do percentual até a entrega</span>
        </label>
      </div>
    </div>
  );
};
