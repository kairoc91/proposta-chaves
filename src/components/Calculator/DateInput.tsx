import React, { useRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

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

// Converter DD/MM/AAAA para YYYY-MM-DD
const displayToIso = (displayStr: string): string => {
  const clean = displayStr.replace(/\D/g, '');
  if (clean.length === 8) {
    const d = clean.slice(0, 2);
    const m = clean.slice(2, 4);
    const y = clean.slice(4, 8);
    return `${y}-${m}-${d}`;
  }
  return '';
};

// Formatador automático de máscara DD/MM/AAAA ao digitar
const formatTypedDate = (raw: string): string => {
  const clean = raw.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
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
  const [displayText, setDisplayText] = useState<string>(isoToDisplay(value));

  useEffect(() => {
    setDisplayText(isoToDisplay(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    const formatted = formatTypedDate(typed);
    setDisplayText(formatted);

    const iso = displayToIso(formatted);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: name || e.target.name,
        value: iso,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIso = e.target.value;
    setDisplayText(isoToDisplay(newIso));
    onChange(e);
  };

  const openCalendarPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={openCalendarPicker}
        disabled={disabled}
        tabIndex={-1}
        title="Abrir calendário para selecionar a data"
        aria-label="Abrir calendário para selecionar a data"
        style={{
          position: 'absolute',
          left: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: 'var(--color-pantone-9580c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        <Calendar size={18} />
      </button>

      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        className={className}
        value={displayText}
        placeholder={placeholder}
        onChange={handleTextChange}
        disabled={disabled}
        required={required}
        style={{
          paddingLeft: '2.5rem',
          ...style,
        }}
      />
      <input
        ref={hiddenDateRef}
        type="date"
        value={value || ''}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px',
          border: 0,
          top: '50%',
          left: '0.85rem',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
};
