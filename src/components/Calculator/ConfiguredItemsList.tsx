import React from 'react';
import type { PaymentItem, PaymentCategory, EntryType } from '../../utils/calculatorEngine';
import { formatBRL, formatDateBR } from '../../utils/formatters';
import { Trash2, Coins, Key, Car, Building2, Wrench, CalendarDays, FileText, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';

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

  const getCategoryIcon = (cat: PaymentCategory, type?: EntryType) => {
    switch (cat) {
      case 'sinal':
        return <Coins size={18} style={{ color: '#bcbcbc' }} />;
      case 'entrada':
        if (type === 'imovel') return <Building2 size={18} style={{ color: '#3b82f6' }} />;
        if (type === 'veiculo') return <Car size={18} style={{ color: '#10b981' }} />;
        if (type === 'servico') return <Wrench size={18} style={{ color: '#ec4899' }} />;
        return <Coins size={18} style={{ color: '#6366f1' }} />;
      case 'parcela_intermediaria':
        return <CalendarDays size={18} style={{ color: '#a855f7' }} />;
      case 'chaves':
        return <Key size={18} style={{ color: '#14b8a6' }} />;
    }
  };

  const getCategoryLabel = (cat: PaymentCategory) => {
    switch (cat) {
      case 'sinal': return 'Sinal';
      case 'entrada': return 'Entrada';
      case 'parcela_intermediaria': return 'Intermediárias';
      case 'chaves': return 'Chaves';
    }
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
          <ListOrdered size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            LANÇAMENTOS
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isExpanded && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(214, 255, 0, 0.1)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
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
                return (
                  <div 
                    key={item.id} 
                    className="payment-list-item"
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'var(--bg-tertiary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {getCategoryIcon(item.category, item.entryType)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.description}
                          </span>
                          <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            {getCategoryLabel(item.category)}
                          </span>
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
