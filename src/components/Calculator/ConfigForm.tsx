import React, { useRef, useEffect } from 'react';
import { formatBRL, parseBRLString } from '../../utils/formatters';
import { InputHelper } from './InputHelper';
import { DateInput } from './DateInput';

interface ConfigFormProps {
  totalProposal: number;
  setTotalProposal: (val: number) => void;
  keyDeliveryDate: string;
  setKeyDeliveryDate: (val: string) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  totalProposal,
  setTotalProposal,
  keyDeliveryDate,
  setKeyDeliveryDate,
}) => {
  const proposalInputRef = useRef<HTMLInputElement>(null);
  const formattedProposal = totalProposal > 0 ? formatBRL(totalProposal) : '';

  useEffect(() => {
    if (proposalInputRef.current && totalProposal > 0) {
      const len = proposalInputRef.current.value.length;
      proposalInputRef.current.setSelectionRange(len, len);
    }
  }, [totalProposal]);

  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numVal = parseBRLString(rawVal);
    setTotalProposal(numVal);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.25rem 1rem' }}>
      {/* Preço Proposta */}
      <div className="form-group">
        <label htmlFor="total-proposal-input" className="form-label">
          Preço da Proposta
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={proposalInputRef}
            id="total-proposal-input"
            type="text"
            inputMode="numeric"
            className="form-input"
            value={formattedProposal}
            onChange={handleProposalChange}
            placeholder="Valor total"
            style={{ fontWeight: 700, color: 'var(--color-pantone-9580c)', fontSize: '1.05rem', padding: '0.9rem 2.8rem' }}
          />
          <div className="input-helper-container">
            <InputHelper 
              title="Preço Proposta" 
              text="Informe o valor total bruto da proposta comercial de compra do imóvel." 
            />
          </div>
        </div>
      </div>

      {/* Data de Entrega */}
      <div className="form-group">
        <label htmlFor="key-delivery-date-input" className="form-label">
          Data de Entrega das Chaves
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <DateInput
            id="key-delivery-date-input"
            className="form-input"
            value={keyDeliveryDate}
            onChange={(e) => setKeyDeliveryDate(e.target.value)}
            placeholder="dd/mm/aaaa"
            style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem', padding: '0.9rem 2.8rem' }}
            required
          />
          <div className="input-helper-container">
            <InputHelper 
              title="Data de Entrega" 
              text="Selecione a data prevista de entrega das chaves. Ela divide as parcelas em pagamentos ANTES e APÓS a entrega." 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
