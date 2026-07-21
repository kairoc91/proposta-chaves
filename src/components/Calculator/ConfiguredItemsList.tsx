import React from 'react';
import type { PaymentItem, PaymentCategory } from '../../utils/calculatorEngine';
import { formatBRL, formatDateBR } from '../../utils/formatters';
import { Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface ConfiguredItemsListProps {
  paymentItems: PaymentItem[];
  setPaymentItems: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  totalProposal: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ConfiguredItemsList: React.FC<ConfiguredItemsListProps> = ({
  paymentItems,
  setPaymentItems,
  totalProposal,
  isExpanded,
  onToggle,
}) => {
  const handleRemoveItem = (id: string) => {
    setPaymentItems((prev) => prev.filter((item) => item.id !== id));
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
          color: 'var(--text-secondary)', // #BCBCBC
          background: 'rgba(188, 188, 188, 0.12)',
          border: '1px solid rgba(188, 188, 188, 0.25)',
        };
      case 'entrada':
        return {
          color: 'var(--color-primary)', // #D6FF00
          background: 'rgba(214, 255, 0, 0.12)',
          border: '1px solid rgba(214, 255, 0, 0.25)',
        };
      case 'parcela_intermediaria':
        return {
          color: '#ffffff', // #FFFFFF
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
      case 'chaves':
        return {
          color: 'var(--color-primary)', // #D6FF00
          background: 'rgba(214, 255, 0, 0.12)',
          border: '1px solid rgba(214, 255, 0, 0.25)',
        };
    }
  };

  const isSectionFilled = paymentItems.length > 0;

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
          {!isExpanded && (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(214, 255, 0, 0.12)', border: '1px solid rgba(214, 255, 0, 0.25)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
              {paymentItems.length} {paymentItems.length === 1 ? 'item' : 'itens'}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>

      {/* Conteúdo Expansível (Lista de Itens) */}
      {isExpanded && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
          {paymentItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem', padding: '2.5rem 0' }}>
              <FileText size={48} strokeWidth={1} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Nenhum pagamento adicionado ainda</p>
                <p style={{ fontSize: '0.8rem' }}>Abra o painel "PAGAMENTOS" acima para adicionar itens de pagamento à proposta.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {paymentItems.map((item) => {
                const itemTotal = item.value * item.installmentsCount;
                const itemPercent = totalProposal > 0 ? (itemTotal / totalProposal) * 100 : 0;
                const badgeStyle = getCategoryBadgeStyle(item.category);

                return (
                  <div 
                    key={item.id} 
                    className="payment-list-item"
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {/* Badge da Categoria no Começo da Linha */}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '0.25rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'nowrap',
                        ...badgeStyle
                      }}>
                        {getCategoryLabel(item.category)}
                      </span>

                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.installmentsCount > 1 ? (
                            <>
                              {item.installmentsCount} parcelas de {formatBRL(item.value)} ({item.recurrence})
                            </>
                          ) : (
                            <>Vencimento: {formatDateBR(item.startDate)}</>
                          )}
                          {item.installmentsCount > 1 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              Início: {formatDateBR(item.startDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="payment-item-actions">
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatBRL(itemTotal)}
                        </span>
                        {itemPercent > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            {itemPercent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                        title="Excluir item de pagamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
