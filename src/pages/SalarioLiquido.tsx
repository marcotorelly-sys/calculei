import { useState } from 'react';
import Layout from '../components/Layout';
import MoneyInput from '../components/MoneyInput';
import ResultCard from '../components/ResultCard';
import { calcularSalarioLiquido, formatarMoeda, type ResultadoSalarioLiquido } from '../lib/calculos';

export default function SalarioLiquido() {
  const [salario, setSalario] = useState(0);
  const [dependentes, setDependentes] = useState(0);
  const [resultado, setResultado] = useState<ResultadoSalarioLiquido | null>(null);
  const [erro, setErro] = useState('');

  const calcular = () => {
    setErro('');
    if (!salario || salario <= 0) {
      setErro('Informe seu salário bruto');
      return;
    }
    const res = calcularSalarioLiquido({ salarioBruto: salario, dependentes });
    setResultado(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (resultado) {
    const items = [
      { label: 'Salário bruto', value: resultado.salarioBruto },
      { label: 'Desconto INSS', value: resultado.descontoINSS, negative: true },
      { label: 'Desconto IRRF', value: resultado.descontoIRRF, negative: true },
      { label: 'Total descontos', value: resultado.totalDescontos, negative: true, highlight: true },
    ];

    return (
      <Layout title="Seu Salário Líquido">
        <ResultCard
          total={resultado.salarioLiquido}
          totalLabel="Você recebe na conta"
          items={items}
          shareText={`Meu salário bruto é ${formatarMoeda(resultado.salarioBruto)} e o líquido é ${formatarMoeda(resultado.salarioLiquido)}. Desconto de ${formatarMoeda(resultado.totalDescontos)}!`}
        />
        <button onClick={() => setResultado(null)}
          className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl text-sm transition-all">
          ← Calcular novamente
        </button>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular Salário Líquido">
      <div className="space-y-5">
        <MoneyInput label="Salário bruto mensal" value={salario} onChange={setSalario} placeholder="2.500,00" />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Número de dependentes (IR)
          </label>
          <p className="text-white/30 text-xs mb-2">Filhos, cônjuge ou pais que você declara no IR</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDependentes(Math.max(0, dependentes - 1))}
              className="w-12 h-12 rounded-xl bg-white/10 text-white text-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center"
            >
              −
            </button>
            <span className="text-white text-2xl font-bold w-8 text-center">{dependentes}</span>
            <button
              onClick={() => setDependentes(Math.min(10, dependentes + 1))}
              className="w-12 h-12 rounded-xl bg-white/10 text-white text-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        <button onClick={calcular}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-lg transition-all shadow-lg shadow-green-500/20">
          CALCULAR SALÁRIO LÍQUIDO
        </button>
      </div>
    </Layout>
  );
}
