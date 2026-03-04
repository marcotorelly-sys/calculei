import { useState } from 'react';
import Layout from '../components/Layout';
import MoneyInput from '../components/MoneyInput';
import ResultCard from '../components/ResultCard';
import { calcularFerias, formatarMoeda, type ResultadoFerias } from '../lib/calculos';

export default function Ferias() {
  const [salario, setSalario] = useState(0);
  const [diasFerias, setDiasFerias] = useState(30);
  const [abono, setAbono] = useState(false);
  const [resultado, setResultado] = useState<ResultadoFerias | null>(null);
  const [erro, setErro] = useState('');

  const calcular = () => {
    setErro('');
    if (!salario || salario <= 0) {
      setErro('Informe seu salário bruto');
      return;
    }
    const res = calcularFerias({ salarioBruto: salario, diasFerias, abonoConvertido: abono });
    setResultado(res);
  };

  if (resultado) {
    const items = [
      { label: `Salário férias (${diasFerias} dias)`, value: resultado.salarioFerias },
      { label: '1/3 constitucional', value: resultado.tercoConstitucional },
      ...(resultado.abonoPecuniario > 0 ? [
        { label: 'Abono pecuniário', value: resultado.abonoPecuniario },
        { label: '1/3 sobre abono', value: resultado.tercoAbono },
      ] : []),
      { label: 'Total bruto', value: resultado.totalBruto, highlight: true },
      ...(resultado.descontoINSS > 0 ? [{ label: 'Desconto INSS', value: resultado.descontoINSS, negative: true }] : []),
      ...(resultado.descontoIRRF > 0 ? [{ label: 'Desconto IRRF', value: resultado.descontoIRRF, negative: true }] : []),
    ];

    return (
      <Layout title="Resultado das Férias">
        <ResultCard
          total={resultado.totalLiquido}
          totalLabel="Você vai receber"
          items={items}
          shareText={`Calculei minhas férias e vou receber ${formatarMoeda(resultado.totalLiquido)} líquido!`}
        />
        <button
          onClick={() => setResultado(null)}
          className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl text-sm transition-all"
        >
          ← Calcular novamente
        </button>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular Férias">
      <div className="space-y-5">
        <MoneyInput label="Salário bruto mensal" value={salario} onChange={setSalario} placeholder="2.500,00" />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2.5">Dias de férias</label>
          <div className="grid grid-cols-4 gap-2">
            {[30, 20, 15, 10].map((d) => (
              <button
                key={d}
                onClick={() => setDiasFerias(d)}
                className={`py-3 rounded-xl font-bold text-center transition-all text-sm ${
                  diasFerias === d
                    ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-400/50'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAbono(!abono)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              abono ? 'bg-green-500 border-green-500' : 'border-white/30'
            }`}
          >
            {abono && <span className="text-white text-xs font-bold">✓</span>}
          </button>
          <label onClick={() => setAbono(!abono)} className="text-white/70 text-sm cursor-pointer select-none">
            Vender 10 dias (abono pecuniário)
          </label>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        <button onClick={calcular}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-lg transition-all shadow-lg shadow-green-500/20">
          CALCULAR FÉRIAS
        </button>
      </div>
    </Layout>
  );
}
