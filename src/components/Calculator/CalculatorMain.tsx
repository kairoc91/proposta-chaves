import React, { useState, useEffect } from 'react';
import { calculatePaymentFlow } from '../../utils/calculatorEngine';
import type { PaymentItem } from '../../utils/calculatorEngine';
import { ConfigForm } from './ConfigForm';
import { PaymentForm } from './PaymentForm';
import { generateProposalPDF } from '../../utils/pdfGenerator';
import { formatBRL, formatDateBR } from '../../utils/formatters';
import { FileText, RotateCcw, Building2, AlertTriangle, ChevronRight } from 'lucide-react';

export const CalculatorMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [totalProposal, setTotalProposal] = useState<number>(0);
  const [keyDeliveryDate, setKeyDeliveryDate] = useState<string>('');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [includeKeysInPercent, setIncludeKeysInPercent] = useState<boolean>(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [step2Warning, setStep2Warning] = useState<string | null>(null);

  // Executar os cálculos
  const result = calculatePaymentFlow(
    totalProposal, 
    keyDeliveryDate, 
    paymentItems, 
    includeKeysInPercent
  );

  const canAdvanceFromStep1 = totalProposal > 0 && Boolean(keyDeliveryDate);

  // Cálculo da distribuição dos pagamentos
  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * (item.installmentsCount || 1)), 0);
  const remainingAmount = totalProposal - totalItemsSum;
  const remainingPercent = totalProposal > 0 ? (remainingAmount / totalProposal) * 100 : 0;
  const isFullyDistributed = Math.abs(remainingAmount) < 0.01;

  // Limpar aviso quando atingir 100%
  useEffect(() => {
    if (isFullyDistributed) {
      setStep2Warning(null);
    }
  }, [isFullyDistributed]);

  const handleResetValues = () => {
    setTotalProposal(0);
    setKeyDeliveryDate('');
    setPaymentItems([]);
    setIncludeKeysInPercent(false);
    setStep2Warning(null);
    setCurrentStep(1);
  };

  const handleAdvanceToStep3 = () => {
    if (!isFullyDistributed) {
      if (remainingAmount > 0) {
        const roundedPercent = Math.round(remainingPercent * 100) / 100;
        const formattedPercent = Number.isInteger(roundedPercent) ? `${roundedPercent}%` : `${roundedPercent.toFixed(2)}%`;
        setStep2Warning(`Atenção: É necessário distribuir 100% do preço da proposta. Faltam ${formatBRL(remainingAmount)} (${formattedPercent}) a serem lançados.`);
      } else {
        const excessAmount = Math.abs(remainingAmount);
        const excessPercent = totalProposal > 0 ? (excessAmount / totalProposal) * 100 : 0;
        const roundedPercent = Math.round(excessPercent * 100) / 100;
        const formattedPercent = Number.isInteger(roundedPercent) ? `${roundedPercent}%` : `${roundedPercent.toFixed(2)}%`;
        setStep2Warning(`Atenção: O valor total dos pagamentos excede o preço da proposta em ${formatBRL(excessAmount)} (${formattedPercent}).`);
      }
      return;
    }
    setStep2Warning(null);
    setCurrentStep(3);
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateProposalPDF({
        totalProposal,
        keyDeliveryDate,
        paymentItems,
        result,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* 1. Logo da Marca INFINITY 7 (Cor RGB 151, 255, 102) */}
      <div 
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '0.5rem',
          paddingBottom: '1.25rem'
        }}
      >
        <div 
          style={{
            width: 'clamp(220px, 50vw, 320px)',
            height: 'clamp(40px, 8vw, 56px)',
            backgroundColor: 'rgb(151, 255, 102)',
            WebkitMask: 'url(/logo-infinity7.png) no-repeat center / contain',
            mask: 'url(/logo-infinity7.png) no-repeat center / contain',
          }}
          title="INFINITY 7 Real Estate Solutions"
        />
      </div>

      {/* 2. Stepper Header com Integração Visual (Connected Folder Tab Design) */}
      <div className="connected-stepper-wrapper animate-fade-in">
        {/* Barra de Abas dos Steps */}
        <div className="connected-stepper-bar">
          {/* Step 1 Tab */}
          <div 
            onClick={() => setCurrentStep(1)}
            className={`step-tab ${currentStep === 1 ? 'active' : ''}`}
          >
            <ChevronRight size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', textTransform: 'uppercase' }}>
              PREÇO
            </span>
          </div>

          {/* Step 2 Tab */}
          <div 
            onClick={() => canAdvanceFromStep1 && setCurrentStep(2)}
            className={`step-tab ${currentStep === 2 ? 'active' : ''} ${!canAdvanceFromStep1 ? 'disabled' : ''}`}
          >
            <ChevronRight size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', textTransform: 'uppercase' }}>
              PAGAMENTO
            </span>
          </div>

          {/* Step 3 Tab */}
          <div 
            onClick={() => {
              if (canAdvanceFromStep1) {
                if (currentStep === 1) setCurrentStep(2);
                handleAdvanceToStep3();
              }
            }}
            className={`step-tab ${currentStep === 3 ? 'active' : ''} ${!canAdvanceFromStep1 ? 'disabled' : ''}`}
          >
            <ChevronRight size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', textTransform: 'uppercase' }}>
              RESULTADO
            </span>
          </div>
        </div>

        {/* Painel de Conteúdo Unificado com a Tab Ativa */}
        <div className="step-content-card">
          {/* STEP 1: PREÇO E DATA */}
          {currentStep === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ConfigForm
                totalProposal={totalProposal}
                setTotalProposal={setTotalProposal}
                keyDeliveryDate={keyDeliveryDate}
                setKeyDeliveryDate={setKeyDeliveryDate}
                includeKeysInPercent={includeKeysInPercent}
                setIncludeKeysInPercent={setIncludeKeysInPercent}
              />

              {/* Botão de Avançar no Step 1 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!canAdvanceFromStep1}
                  className="btn btn-primary btn-sm"
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    opacity: canAdvanceFromStep1 ? 1 : 0.45,
                    cursor: canAdvanceFromStep1 ? 'pointer' : 'not-allowed'
                  }}
                  title={canAdvanceFromStep1 ? 'Avançar para o próximo passo' : 'Preencha o Preço da Proposta e a Data de Entrega para avançar'}
                >
                  AVANÇAR
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LANÇAMENTO DOS PAGAMENTOS */}
          {currentStep === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PaymentForm
                paymentItems={paymentItems}
                setPaymentItems={setPaymentItems}
                keyDeliveryDate={keyDeliveryDate}
                totalProposal={totalProposal}
              />

              {/* Caixa de Aviso caso não esteja 100% distribuído */}
              {step2Warning && (
                <div 
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <AlertTriangle size={22} style={{ flexShrink: 0 }} />
                  <span>{step2Warning}</span>
                </div>
              )}

              {/* Navegação do Step 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                >
                  VOLTAR
                </button>

                <button
                  type="button"
                  onClick={handleAdvanceToStep3}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                >
                  AVANÇAR
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESUMO E GERAR PDF */}
          {currentStep === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>RESUMO DA PROPOSTA</h2>
                </div>
                <button
                  onClick={handleResetValues}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  title="Zerar todos os campos"
                >
                  <RotateCcw size={14} /> RESETAR TUDO
                </button>
              </div>

              {/* Dados Gerais */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(0, 25, 21, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Preço da Proposta</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatBRL(result.totalProposal)}</strong>
                </div>

                <div style={{ background: 'rgba(0, 25, 21, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Data de Entrega</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{keyDeliveryDate ? formatDateBR(keyDeliveryDate) : 'Não informada'}</strong>
                </div>
              </div>

              {/* Resumo dos Lançamentos */}
              <div style={{ background: 'rgba(0, 25, 21, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Pago até as Chaves:</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{formatBRL(result.totalPaidBeforeKeys)} ({result.percentagePaidBeforeKeys.toFixed(2)}%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total de Pagamentos Lançados:</span>
                  <strong>{paymentItems.length} item(ns)</strong>
                </div>
              </div>

              {/* Botões do Step 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                >
                  VOLTAR
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800 }}
                  disabled={isGeneratingPDF}
                >
                  <FileText size={18} />
                  <span>{isGeneratingPDF ? 'GERANDO PDF...' : 'BAIXAR PDF DA PROPOSTA'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </main>
  );
};
