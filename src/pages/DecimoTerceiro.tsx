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
      setErro('Informe seu salario bruto');
      return;
    }
    const res = calcularDecimoTerceiro({ salarioBruto: salario, mesesTrabalhados: meses });
    setResultado(res);
  };

  if (resultado) {
    const items = [
      { label: `13o proporcional (${meses}/12 meses)`, value: resultado.valorBruto },
      ...(resultado.descontoINSS > 0 ? [{ label: 'Desconto INSS', value: resultado.descontoINSS, negative: true }] : []),
      ...(resultado.descontoIRRF > 0 ? [{ label: 'Desconto IRRF', value: resultado.descontoIRRF, negative: true }] : []),
    ];

    return (
      <Layout title="Resultado do 13o">
        <ResultCard
          total={resultado.totalLiquido}
          totalLabel="Seu 13o salario liquido"
          items={items}
          shareText={`Calculei meu 13o salario: ${formatarMoeda(resultado.totalLiquido)} liquido!`}
        />
        <button onClick={() => setResultado(null)}
          className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-2xl text-sm">
          Calcular novamente
        </button>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular 13o Salario">
      <div className="space-y-5">
        <MoneyInput label="Salario bruto mensal" value={salario} onChange={setSalario} placeholder="2.500,00" />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Meses trabalhados no ano
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setMeses(i + 1)}
                className={`p-2.5 rounded-xl font-bold text-center text-sm transition-all ${
                  meses === i + 1
                    ? 'bg-green-500 text-white shadow-lg'
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
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-xl transition-all shadow-lg shadow-green-500/20">
          CALCULAR
        </button>
      </div>
    </Layout>
  );
}
