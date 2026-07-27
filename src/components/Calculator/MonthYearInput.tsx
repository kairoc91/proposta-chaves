import React, { useRef } from 'react';

export interface MonthYearInputProps {
  id?: string;
  /** Data no formato ISO (YYYY-MM ou YYYY-MM-DD) */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  isShortYear?: boolean;
}

/**
 * Converte data ISO (YYYY-MM ou YYYY-MM-DD) em formato amigável de exibição (MM/AAAA ou MM/AA).
 */
const isoToMonthYearDisplay = (isoStr: string, isShortYear: boolean = false): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length >= 2) {
    let [y, m] = parts;
    if (y && m) {
      if (isShortYear && y.length === 4) {
        y = y.substring(2);
      }
      return `${m}/${y}`;
    }
  }
  return isoStr;
};

/**
 * Garante o formato ISO YYYY-MM exigido pelo input nativo de tipo month.
 */
const toMonthIso = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return isoStr;
};

/**
 * Campo de seleção de mês e ano otimizado para navegadores desktop e dispositivos móveis.
 * Utiliza um overlay nativo transparente (opacity: 0) sobre o campo formatado para garantir
 * que toques no iOS Safari abram o seletor nativo sem requerer disparos JS bloqueados.
 */
export const MonthYearInput: React.FC<MonthYearInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'mm/aaaa',
  className = 'form-input',
  style,
  disabled = false,
  required = false,
  name,
  isShortYear = false,
}) => {
  const hiddenMonthRef = useRef<HTMLInputElement>(null);
  const displayVal = isoToMonthYearDisplay(value, isShortYear);
  const monthValue = toMonthIso(value);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    if (disabled) return;
    try {
      if (hiddenMonthRef.current && typeof hiddenMonthRef.current.showPicker === 'function') {
        hiddenMonthRef.current.showPicker();
      }
    } catch {}
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      <input
        id={id}
        type="text"
        readOnly
        tabIndex={-1}
        value={displayVal}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box',
        }}
        disabled={disabled}
        required={required}
        name={name}
      />

      <input
        ref={hiddenMonthRef}
        type="month"
        value={monthValue}
        onChange={handleMonthChange}
        onFocus={handleFocus}
        disabled={disabled}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          zIndex: 10,
          border: 'none',
          margin: 0,
          padding: 0,
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
};
