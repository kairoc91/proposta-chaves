import React, { useState, useEffect } from 'react';
import { calculatePaymentFlow } from '../../utils/calculatorEngine';
import type { PaymentItem } from '../../utils/calculatorEngine';
import { ConfigForm } from './ConfigForm';
import { PaymentForm } from './PaymentForm';
import { generateProposalPDF } from '../../utils/pdfGenerator';
import { formatBRL } from '../../utils/formatters';
import { Download, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const CalculatorMain: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [totalProposal, setTotalProposal] = useState<number>(0);
  const [keyDeliveryDate, setKeyDeliveryDate] = useState<string>('');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [includeKeysInPercent, setIncludeKeysInPercent] = useState<boolean>(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [step2Warning, setStep2Warning] = useState<string | null>(null);

  const result = calculatePaymentFlow(
    totalProposal, 
    keyDeliveryDate, 
    paymentItems, 
    includeKeysInPercent
  );

  const canAdvanceFromStep1 = totalProposal > 0 && Boolean(keyDeliveryDate);

  const navButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#DBFFC9',
    fontSize: '0.85rem',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
    padding: '0.4rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    userSelect: 'none',
  };

  const totalItemsSum = paymentItems.reduce((acc, item) => acc + (item.value * (item.installmentsCount || 1)), 0);
  const isFullyDistributed = totalProposal > 0 && Math.abs(totalItemsSum - totalProposal) < 0.01;

  useEffect(() => {
    if (isFullyDistributed) {
      setStep2Warning(null);
    }
  }, [isFullyDistributed]);

  // Ao fechar o teclado numérico do mobile (focusout), faz o scroll suave de volta ao topo mostrando a logo
  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) {
        setTimeout(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'SELECT')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      }
    };

    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleAdvanceToStep3 = () => {
    if (totalItemsSum === 0) {
      setStep2Warning('Por favor, adicione ao menos 1 pagamento antes de avançar.');
      return;
    }

    if (totalItemsSum < totalProposal) {
      setStep2Warning('Valor inferior ao total');
      return;
    }

    if (totalItemsSum > totalProposal) {
      setStep2Warning('Valor excede ao total');
      return;
    }

    setStep2Warning(null);
    setCurrentStep(3);
  };

  const handleResetValues = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as informações?')) {
      setTotalProposal(0);
      setKeyDeliveryDate('');
      setPaymentItems([]);
      setCurrentStep(1);
      setStep2Warning(null);
    }
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
    <main className="container container-sm" style={{ paddingBottom: '3rem' }}>
      
      <div style={{ textAlign: 'center', margin: '1.75rem 0 2.75rem 0' }}>
        <div 
          style={{
            width: '180px',
            height: '42px',
            margin: '0 auto',
            backgroundColor: 'var(--color-pantone-902c)',
            WebkitMask: 'url(/logo-infinity7.png) no-repeat center / contain',
            mask: 'url(/logo-infinity7.png) no-repeat center / contain',
          }}
          title="INFINITY 7 Real Estate Solutions"
        />
      </div>

      <div className="connected-stepper-wrapper animate-fade-in">
        {(() => {
          const isStep1Complete = canAdvanceFromStep1 && currentStep > 1;
          const isStep2Complete = isFullyDistributed && currentStep > 2;
          const isStep3Complete = currentStep === 3 && isFullyDistributed;

          return (
            <div className="number-stepper-container">
              <div className="stepper-line">
                <div 
                  className="stepper-line-progress" 
                  style={{ 
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' 
                  }} 
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`step-item ${currentStep === 1 ? 'active' : ''} ${isStep1Complete ? 'completed' : ''}`}
                title="Passo 1: Preço e Data"
                aria-label="Passo 1: Preço e Data"
              >
                <div className="step-number-circle">
                  {isStep1Complete ? <Check size={18} strokeWidth={3} /> : '1'}
                </div>
                <span className="step-number-label">PREÇO</span>
              </button>

              <button
                type="button"
                onClick={() => canAdvanceFromStep1 && setCurrentStep(2)}
                disabled={!canAdvanceFromStep1}
                className={`step-item ${currentStep === 2 ? 'active' : ''} ${isStep2Complete ? 'completed' : ''} ${!canAdvanceFromStep1 ? 'disabled' : ''}`}
                title="Passo 2: Pagamentos"
                aria-label="Passo 2: Pagamentos"
              >
                <div className="step-number-circle">
                  {isStep2Complete ? <Check size={18} strokeWidth={3} /> : '2'}
                </div>
                <span className="step-number-label">PAGAMENTO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (canAdvanceFromStep1) {
                    if (currentStep === 1) setCurrentStep(2);
                    handleAdvanceToStep3();
                  }
                }}
                disabled={!canAdvanceFromStep1}
                className={`step-item ${currentStep === 3 ? 'active' : ''} ${isStep3Complete ? 'completed' : ''} ${!canAdvanceFromStep1 ? 'disabled' : ''}`}
                title="Passo 3: Resultado"
                aria-label="Passo 3: Resultado"
              >
                <div className="step-number-circle">
                  {isStep3Complete ? <Check size={18} strokeWidth={3} /> : '3'}
                </div>
                <span className="step-number-label">RESULTADO</span>
              </button>
            </div>
          );
        })()}

        <div className="step-content-card">
          {currentStep === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Botão de Avançar no Step 1 (Acima dos Inputs) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem', padding: '0 1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!canAdvanceFromStep1}
                  style={{
                    ...navButtonStyle,
                    opacity: canAdvanceFromStep1 ? 1 : 0.45,
                    cursor: canAdvanceFromStep1 ? 'pointer' : 'not-allowed'
                  }}
                  title={canAdvanceFromStep1 ? 'Avançar para o próximo passo' : 'Preencha o Preço da Proposta e a Data de Entrega para avançar'}
                >
                  <span>AVANÇAR</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              <ConfigForm
                totalProposal={totalProposal}
                setTotalProposal={setTotalProposal}
                keyDeliveryDate={keyDeliveryDate}
                setKeyDeliveryDate={setKeyDeliveryDate}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', padding: '0 1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={navButtonStyle}
                >
                  <ChevronLeft size={18} />
                  <span>VOLTAR</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdvanceToStep3}
                  style={navButtonStyle}
                >
                  <span>AVANÇAR</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              <PaymentForm
                paymentItems={paymentItems}
                setPaymentItems={setPaymentItems}
                keyDeliveryDate={keyDeliveryDate}
                totalProposal={totalProposal}
                step2Warning={step2Warning}
              />
            </div>
          )}

          {currentStep === 3 && (() => {
            const rawPaid = result.totalPaidBeforeKeys;
            const percentPaid = Math.min(100, Math.max(0, result.percentagePaidBeforeKeys));
            const radius = 110;
            const strokeWidth = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(percentPaid / 100) * circumference} ${circumference}`;

            const formattedPaidPercent = Number.isInteger(Math.round(percentPaid * 100) / 100)
              ? `${Math.round(percentPaid)}%`
              : `${percentPaid.toFixed(2)}%`;

            return (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Topo do Step 3: VOLTAR + Botão PDF */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', padding: '0 1rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={navButtonStyle}
                  >
                    <ChevronLeft size={18} />
                    <span>VOLTAR</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGeneratePDF}
                    className="btn btn-primary"
                    style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800, borderRadius: '15px', fontSize: '0.85rem', flexShrink: 0 }}
                    disabled={isGeneratingPDF}
                  >
                    <Download size={16} />
                    <span>{isGeneratingPDF ? 'GERANDO...' : 'PDF'}</span>
                  </button>
                </div>

                {/* Gráfico Donut (Tamanho Expandido 340px) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0' }}>
                  <div style={{ position: 'relative', width: '340px', height: '340px', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="100%" viewBox="0 0 270 270" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Trilha de Fundo do Donut */}
                      <circle
                        cx="135"
                        cy="135"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(219, 255, 201, 0.12)"
                        strokeWidth={strokeWidth}
                      />
                      {/* Segmento Pago (Pantone 902 C) */}
                      <circle
                        cx="135"
                        cy="135"
                        r={radius}
                        fill="transparent"
                        stroke="var(--color-pantone-902c)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease-in-out' }}
                      />
                    </svg>

                    {/* Conteúdo Central do Donut */}
                    <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                        Pago até a Entrega
                      </span>
                      <strong style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                        {formatBRL(rawPaid)}
                      </strong>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-pantone-902c)', marginTop: '0.3rem' }}>
                        {formattedPaidPercent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Step 3: Chave Seletora + RESETAR TUDO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', gap: '0.75rem', padding: '0 1rem' }}>
                  <label 
                    onClick={() => setIncludeKeysInPercent(!includeKeysInPercent)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.6rem', 
                      cursor: 'pointer', 
                      userSelect: 'none', 
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-pantone-9580c)',
                      margin: 0
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '12px',
                        backgroundColor: includeKeysInPercent ? 'var(--color-pantone-902c)' : 'rgba(255, 255, 255, 0.15)',
                        position: 'relative',
                        transition: 'background-color 0.25s ease',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: includeKeysInPercent ? 'rgb(0, 36, 30)' : '#ffffff',
                          position: 'absolute',
                          top: '2px',
                          left: includeKeysInPercent ? '20px' : '2px',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>
                    <span>INCLUIR CHAVES</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleResetValues}
                    className="btn btn-primary"
                    style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800, borderRadius: '25px', fontSize: '0.85rem', flexShrink: 0 }}
                    title="Zerar todos os campos"
                  >
                    <RotateCcw size={16} />
                    <span>REINICIAR</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

    </main>
  );
};
