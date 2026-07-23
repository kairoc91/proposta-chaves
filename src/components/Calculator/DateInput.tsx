import React, { useRef } from 'react';

export interface DateInputProps {
  id?: string;
  value: string; // ISO format YYYY-MM-DD
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

// Converter YYYY-MM-DD para DD/MM/AAAA
const isoToDisplay = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y && m && d) return `${d}/${m}/${y}`;
  }
  return isoStr;
};

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  className = 'form-input',
  style,
  disabled = false,
  required = false,
  name,
}) => {
  const hiddenDateRef = useRef<HTMLInputElement>(null);
  const displayVal = isoToDisplay(value);

  const handleContainerClick = () => {
    if (disabled) return;
    try {
      if (hiddenDateRef.current) {
        if (typeof hiddenDateRef.current.showPicker === 'function') {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.click();
        }
      }
    } catch {}
  };

  return (
    <div 
      onClick={handleContainerClick}
      style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {/* Input de texto visível exibindo a data formatada em DD/MM/AAAA */}
      <input
        id={id}
        type="text"
        className={className}
        value={displayVal}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        required={required}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...style,
        }}
      />

      {/* Input nativo de data transparente cobrindo 100% da área para abrir o calendário nativo no mobile (iOS/Android) e desktop */}
      <input
        ref={hiddenDateRef}
        name={name}
        type="date"
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.001,
          cursor: disabled ? 'not-allowed' : 'pointer',
          zIndex: 10,
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
};
