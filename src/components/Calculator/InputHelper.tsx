import React, { useState } from 'react';

interface InputHelperProps {
  text: string;
  title?: string;
}

export const InputHelper: React.FC<InputHelperProps> = ({ text, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
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
          color: 'var(--color-pantone-9580c)',
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
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            zIndex: 999,
            width: '230px',
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
