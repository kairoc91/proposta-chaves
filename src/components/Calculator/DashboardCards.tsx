import React from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';

interface DashboardCardsProps {
  totalProposal: number;
  totalPaidBeforeKeys: number;
  percentagePaidBeforeKeys: number;
}

// Formatador compacto para valores dentro do donut (sem centavos)
const formatCompactBRL = (val: number): string => {
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
};

interface DonutChartProps {
  value: string;
  subValue?: string;
  percent: number;
  color: string;
  label: string;
  icon: React.ReactNode;
}

const DonutChart: React.FC<DonutChartProps> = ({ value, subValue, percent, color, label, icon }) => {
  const r = 44;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * r;
  // Limita o percentual visual entre 0 e 100 para o preenchimento da linha do arco
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circ * (1 - safePercent / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
      {/* SVG Donut Fluido */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '160px', aspectRatio: '1/1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Pista do Donut */}
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Arco colorido de preenchimento */}
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        {/* Texto centralizado com valor principal e sub-valor percentual */}
        <div className="donut-center-text" style={{ flexDirection: 'column', gap: '0.15rem' }}>
          <span className="donut-main-val">{value}</span>
          {subValue && (
            <span className="donut-sub-val">
              {subValue}
            </span>
          )}
        </div>
      </div>
      
      {/* Rótulo inferior responsivo */}
      <div className="donut-label">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
};

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  totalProposal,
  totalPaidBeforeKeys,
  percentagePaidBeforeKeys,
}) => {
  const remainingTotal = Math.max(0, totalProposal - totalPaidBeforeKeys);
  const remainingPercent = totalProposal > 0 ? (remainingTotal / totalProposal) * 100 : 0;

  return (
    <div 
      className="animate-fade-in"
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(18, 18, 18, 0.9)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--card-border)',
        padding: '1rem 0',
        marginLeft: '-0.35rem', 
        marginRight: '-0.35rem',
        paddingLeft: '0.35rem',
        paddingRight: '0.35rem',
        marginBottom: '1.5rem'
      }}
    >
      <div className="dashboard-grid">
        {/* ATÉ ENTREGA (Valor Pago até as chaves) */}
        <div className="glass-card dashboard-card">
          <DonutChart
            value={formatCompactBRL(totalPaidBeforeKeys)}
            subValue={`${percentagePaidBeforeKeys.toFixed(2)}%`}
            percent={totalProposal > 0 ? (totalPaidBeforeKeys / totalProposal) * 100 : 0}
            color="var(--color-success)"
            label="ATÉ ENTREGA"
            icon={<ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />}
          />
        </div>

        {/* APÓS ENTREGA (Saldo Pós-Chaves) */}
        <div className="glass-card dashboard-card">
          <DonutChart
            value={formatCompactBRL(remainingTotal)}
            subValue={`${remainingPercent.toFixed(2)}%`}
            percent={remainingPercent}
            color="var(--color-warning)"
            label="APÓS ENTREGA"
            icon={<Wallet size={16} style={{ color: 'var(--color-warning)' }} />}
          />
        </div>
      </div>
    </div>
  );
};
