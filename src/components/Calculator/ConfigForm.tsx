import React, { useRef, useEffect } from 'react';
import { formatBRL, parseBRLString } from '../../utils/formatters';
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
          Valor total
        </label>
        <input
          ref={proposalInputRef}
          id="total-proposal-input"
          type="text"
          inputMode="numeric"
          className="form-input"
          value={formattedProposal}
          onChange={handleProposalChange}
          placeholder="R$ 0,00"
          style={{ fontWeight: 700, fontSize: '1.05rem', padding: '0.9rem 0.75rem' }}
        />
      </div>

      {/* Data de Entrega */}
      <div className="form-group">
        <label htmlFor="key-delivery-date-input" className="form-label">
          Data de entrega
        </label>
        <DateInput
          id="key-delivery-date-input"
          className="form-input"
          value={keyDeliveryDate}
          onChange={(e) => setKeyDeliveryDate(e.target.value)}
          placeholder="dd/mm/aaaa"
          style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem', padding: '0.9rem 0.75rem' }}
          required
        />
      </div>
    </div>
  );
};
