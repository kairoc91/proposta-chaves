import React, { useState } from 'react';
import { calculatePaymentFlow } from '../../utils/calculatorEngine';
import type { PaymentItem } from '../../utils/calculatorEngine';
import { ConfigForm } from './ConfigForm';
import { DashboardCards } from './DashboardCards';
import { PaymentForm } from './PaymentForm';
import { ConfiguredItemsList } from './ConfiguredItemsList';

import { Printer } from 'lucide-react';

export const CalculatorMain: React.FC = () => {
  // Inicialização com valores zerados
  const [totalProposal, setTotalProposal] = useState<number>(0);
  const [keyDeliveryDate, setKeyDeliveryDate] = useState<string>('');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [includeKeysInPercent, setIncludeKeysInPercent] = useState<boolean>(false);

  // Estado do Accordion (Proposta vs Pagamento vs Itens - 1 aberto por vez)
  const [activeSection, setActiveSection] = useState<'proposta' | 'pagamento' | 'itens' | null>('proposta');

  const toggleSection = (section: 'proposta' | 'pagamento' | 'itens') => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  // Executar os cálculos
  const result = calculatePaymentFlow(
    totalProposal, 
    keyDeliveryDate, 
    paymentItems, 
    includeKeysInPercent
  );

  const handleResetValues = () => {
    setTotalProposal(0);
    setKeyDeliveryDate('');
    setPaymentItems([]);
    setIncludeKeysInPercent(false);
    setActiveSection('proposta');
  };

  const handleGeneratePDF = () => {
    // Abrir a aba de lançamentos para incluir no PDF
    setActiveSection('itens');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* 1. Fixed Top Dashboard KPIs */}
      <DashboardCards
        totalProposal={result.totalProposal}
        totalPaidBeforeKeys={result.totalPaidBeforeKeys}
        percentagePaidBeforeKeys={result.percentagePaidBeforeKeys}
      />

      {/* Top Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Reset button */}
        <button 
          onClick={handleResetValues}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.8rem' }}
          title="Zerar todos os campos e fluxos"
        >
          RESETAR VALORES
        </button>

        {/* Gerar PDF button */}
        <button 
          onClick={handleGeneratePDF}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.8rem' }}
          title="Gerar PDF da Proposta e Fluxo"
        >
          <Printer size={16} />
          GERAR PDF
        </button>
      </div>

      {/* 2. Global Setup Config Form (Accordion Section 1) */}
      <ConfigForm
        totalProposal={totalProposal}
        setTotalProposal={setTotalProposal}
        keyDeliveryDate={keyDeliveryDate}
        setKeyDeliveryDate={setKeyDeliveryDate}
        includeKeysInPercent={includeKeysInPercent}
        setIncludeKeysInPercent={setIncludeKeysInPercent}
        isExpanded={activeSection === 'proposta'}
        onToggle={() => toggleSection('proposta')}
      />

      {/* 3. Dynamic Payment Builder Section (Accordion Section 2) */}
      <PaymentForm
        paymentItems={paymentItems}
        setPaymentItems={setPaymentItems}
        keyDeliveryDate={keyDeliveryDate}
        totalProposal={totalProposal}
        isExpanded={activeSection === 'pagamento'}
        onToggle={() => toggleSection('pagamento')}
        onItemAdded={() => toggleSection('itens')}
      />

      {/* 4. Configured Items List Section (Accordion Section 3) */}
      <ConfiguredItemsList
        paymentItems={paymentItems}
        setPaymentItems={setPaymentItems}
        totalProposal={totalProposal}
        isExpanded={activeSection === 'itens'}
        onToggle={() => toggleSection('itens')}
      />

    </main>
  );
};
