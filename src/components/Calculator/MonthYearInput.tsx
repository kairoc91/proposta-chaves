import React, { useRef } from 'react';

export interface MonthYearInputProps {
  id?: string;
  value: string; // ISO format YYYY-MM ou YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  isShortYear?: boolean;
}

// Converter YYYY-MM ou YYYY-MM-DD para MM/AAAA ou MM/AA
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

// Garantir formato YYYY-MM para o input type="month"
const toMonthIso = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return isoStr;
};

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
    const newVal = e.target.value; // Formato YYYY-MM
    onChange(newVal);
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
      {/* Input de texto visível exibindo o mês/ano formatado em MM/AAAA */}
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

      {/* Input nativo transparente sobreposto 100% que recebe o toque do usuário no mobile */}
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
