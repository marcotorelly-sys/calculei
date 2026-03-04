import { useState } from 'react';
import Layout from '../components/Layout';
import MoneyInput from '../components/MoneyInput';
import ResultCard from '../components/ResultCard';
import { calcularDecimoTerceiro, formatarMoeda, type ResultadoDecimoTerceiro } from '../lib/calculos';

export default function DecimoTerceiro() {
  const [salario, setSalario] = useState(0);
  const [meses, setMeses] = useState(12);
  const [resultado, setResultado] = useState<ResultadoDecimoTerceiro | null>(null);
  const [erro, setErro] = useState('');

  const calcular = () => {
    setErro('');
    if (!salario || salario <= 0) {
      setErro('Informe seu salário bruto');
      return;
    }
    const res = calcularDecimoTerceiro({ salarioBruto: salario, mesesTrabalhados: meses });
    setResultado(res);
  };

  if (resultado) {
    const items = [
      { label: `13º proporcional (${meses}/12 meses)`, value: resultado.valorBruto },
      ...(resultado.descontoINSS > 0 ? [{ label: 'Desconto INSS', value: resultado.descontoINSS, negative: true }] : []),
      ...(resultado.descontoIRRF > 0 ? [{ label: 'Desconto IRRF', value: resultado.descontoIRRF, negative: true }] : []),
    ];

    return (
      <Layout title="Resultado do 13º">
        <ResultCard
          total={resultado.totalLiquido}
          totalLabel="Seu 13º salário líquido"
          items={items}
          shareText={`Calculei meu 13º salário: ${formatarMoeda(resultado.totalLiquido)} líquido!`}
        />
        <button onClick={() => setResultado(null)}
          className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl text-sm transition-all">
          ← Calcular novamente
        </button>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular 13º Salário">
      <div className="space-y-5">
        <MoneyInput label="Salário bruto mensal" value={salario} onChange={setSalario} placeholder="2.500,00" />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2.5">
            Meses trabalhados no ano
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {[...Array(12)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setMeses(i + 1)}
                className={`py-2.5 rounded-xl font-bold text-center text-sm transition-all ${
                  meses === i + 1
                    ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-400/50'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        <button onClick={calcular}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-lg transition-all shadow-lg shadow-green-500/20">
          CALCULAR 13º SALÁRIO
        </button>
      </div>
    </Layout>
  );
}
