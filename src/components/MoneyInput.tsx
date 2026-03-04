import { useState, useRef, useEffect } from 'react';

function formatBRL(centavos: number): string {
  if (centavos === 0) return '';
  const reais = centavos / 100;
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MoneyInput({ label, value, onChange, placeholder = "0,00" }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  const [centavos, setCentavos] = useState(Math.round(value * 100));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === 0 && centavos !== 0) {
      setCentavos(0);
    }
  }, [value, centavos]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const novo = Math.floor(centavos / 10);
        setCentavos(novo);
        onChange(novo / 100);
      }
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const novo = centavos * 10 + parseInt(e.key);
    if (novo > 99999999) return;
    setCentavos(novo);
    onChange(novo / 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setCentavos(0);
      onChange(0);
      return;
    }
    const novo = parseInt(raw);
    if (novo > 99999999) return;
    setCentavos(novo);
    onChange(novo / 100);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formatBRL(centavos)}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white text-lg font-semibold placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}
