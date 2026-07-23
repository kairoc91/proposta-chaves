import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InputHelperProps {
  text: string;
  title?: string;
}

export const InputHelper: React.FC<InputHelperProps> = ({ text, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;

    const btnRect = buttonRef.current.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 12;
    const gap = 8;

    // Posicionar acima do botão, alinhado à direita
    let top = btnRect.top - tipRect.height - gap;
    let left = btnRect.right - tipRect.width;

    // Se ultrapassar a borda esquerda
    if (left < margin) {
      left = margin;
    }

    // Se ultrapassar a borda direita
    if (left + tipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - margin - tipRect.width;
    }

    // Se ultrapassar o topo, posicionar abaixo
    if (top < margin) {
      top = btnRect.bottom + gap;
    }

    setTooltipPos({ top, left });
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Aguardar o render para calcular
      requestAnimationFrame(calculatePosition);
    }
  }, [isOpen, calculatePosition]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        title={title || 'Ajuda'}
        aria-label={title || 'Ajuda'}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '1px solid rgba(219, 255, 201, 0.5)',
          backgroundColor: isOpen ? 'rgba(219, 255, 201, 0.25)' : 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(219, 255, 201, 0.5)',
          fontSize: '0.75rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          lineHeight: 1,
          boxShadow: isOpen ? '0 0 10px rgba(219, 255, 201, 0.4)' : 'none'
        }}
      >
        ?
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            zIndex: 9999,
            width: `min(230px, calc(100vw - 24px))`,
            backgroundColor: '#021410',
            border: '1px solid var(--color-pantone-9580c)',
            borderRadius: '12px',
            padding: '0.75rem 0.9rem',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.9)',
            color: '#ffffff',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            pointerEvents: 'none'
          }}
        >
          {title && (
            <strong style={{ color: 'var(--color-pantone-9580c)', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 800 }}>
              {title}
            </strong>
          )}
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.95)' }}>{text}</p>
        </div>
      )}
    </div>
  );
};
