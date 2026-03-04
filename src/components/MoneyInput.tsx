import { useState } from 'react';

export default function MoneyInput({ label, value, onChange, placeholder = "0,00" }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(value ? value.toFixed(2).replace('.', ',') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d,]/g, '');
    setDisplay(raw);
    const num = parseFloat(raw.replace(',', '.'));
    if (!isNaN(num)) onChange(num);
    else onChange(0);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
      </div>
    </div>
  );
}
