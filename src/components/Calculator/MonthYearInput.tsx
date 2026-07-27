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

  const handleContainerClick = () => {
    if (disabled) return;
    try {
      if (hiddenMonthRef.current) {
        if (typeof hiddenMonthRef.current.showPicker === 'function') {
          hiddenMonthRef.current.showPicker();
        } else {
          hiddenMonthRef.current.click();
        }
      }
    } catch {}
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value; // Formato YYYY-MM
    onChange(newVal);
  };

  return (
    <div 
      onClick={handleContainerClick}
      style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {/* Input de texto visível exibindo o mês/ano formatado em MM/AAAA */}
      <input
        id={id}
        type="text"
        readOnly
        value={displayVal}
        placeholder={placeholder}
        className={className}
        style={{ ...style, cursor: disabled ? 'not-allowed' : 'pointer' }}
        disabled={disabled}
        required={required}
        name={name}
      />

      {/* Input oculto do tipo month para abrir o seletor nativo */}
      <input
        ref={hiddenMonthRef}
        type="month"
        value={monthValue}
        onChange={handleMonthChange}
        disabled={disabled}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px',
          bottom: 0,
          left: 0,
        }}
      />
    </div>
  );
};
