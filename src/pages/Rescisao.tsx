import { useState } from 'react';
import Layout from '../components/Layout';
import MoneyInput from '../components/MoneyInput';
import ResultCard from '../components/ResultCard';
import {
  calcularRescisao, formatarMoeda, labelTipoRescisao,
  type TipoRescisao, type ResultadoRescisao
} from '../lib/calculos';

const tipos: { value: TipoRescisao; label: string; desc: string }[] = [
  { value: 'sem_justa_causa', label: 'Fui demitido', desc: 'Demissao sem justa causa' },
  { value: 'pedido_demissao', label: 'Pedi demissao', desc: 'Pedido de demissao' },
  { value: 'acordo', label: 'Acordo', desc: 'Rescisao por acordo mutuo (Art. 484-A)' },
  { value: 'justa_causa', label: 'Justa causa', desc: 'Demissao por justa causa' },
];

export default function Rescisao() {
  const [salario, setSalario] = useState(0);
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDemissao, setDataDemissao] = useState('');
  const [tipo, setTipo] = useState<TipoRescisao>('sem_justa_causa');
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [resultado, setResultado] = useState<ResultadoRescisao | null>(null);
  const [erro, setErro] = useState('');

  const calcular = () => {
    setErro('');
    if (!salario || salario <= 0) {
      setErro('Informe seu salario bruto');
      return;
    }
    if (!dataAdmissao) {
      setErro('Informe a data de admissao');
      return;
    }
    if (!dataDemissao) {
      setErro('Informe a data de demissao/saida');
      return;
    }
    if (new Date(dataDemissao) <= new Date(dataAdmissao)) {
      setErro('A data de saida deve ser posterior a admissao');
      return;
    }

    const res = calcularRescisao({
      salarioBruto: salario,
      dataAdmissao,
      dataDemissao,
      tipoRescisao: tipo,
      feriasVencidas,
    });
    setResultado(res);
  };

  if (resultado) {
    const items = [
      { label: 'Saldo de salario', value: resultado.saldoSalario },
      ...(resultado.avisoPrevio > 0 ? [{
        label: `Aviso previo (${resultado.diasAvisoPrevio} dias)`,
        value: resultado.avisoPrevio
      }] : []),
      ...(resultado.feriasProporcional > 0 ? [{
        label: 'Ferias proporcionais',
        value: resultado.feriasProporcional
      }] : []),
      ...(resultado.feriasVencidas > 0 ? [{
        label: 'Ferias vencidas',
        value: resultado.feriasVencidas
      }] : []),
      ...(resultado.tercoFerias > 0 ? [{
        label: '1/3 constitucional',
        value: resultado.tercoFerias
      }] : []),
      ...(resultado.decimoTerceiro > 0 ? [{
        label: '13o proporcional',
        value: resultado.decimoTerceiro
      }] : []),
      ...(resultado.multaFGTS > 0 ? [{
        label: `Multa FGTS (${resultado.tipoRescisao === 'acordo' ? '20' : '40'}%)`,
        value: resultado.multaFGTS
      }] : []),
      { label: 'Total bruto', value: resultado.totalBruto, highlight: true },
      ...(resultado.descontoINSS > 0 ? [{
        label: 'Desconto INSS',
        value: resultado.descontoINSS,
        negative: true,
      }] : []),
      ...(resultado.descontoIRRF > 0 ? [{
        label: 'Desconto IRRF',
        value: resultado.descontoIRRF,
        negative: true,
      }] : []),
    ];

    const shareText = `Fiz uma simulacao de rescisao e descobri que tenho direito a receber ${formatarMoeda(resultado.totalLiquido)}! (${labelTipoRescisao(resultado.tipoRescisao)}, ${resultado.mesesTrabalhados} meses)`;

    return (
      <Layout title="Resultado da Rescisao">
        <div className="space-y-4">
          {/* Info tipo */}
          <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-white/50 text-sm">
              {labelTipoRescisao(resultado.tipoRescisao)} &bull; {resultado.mesesTrabalhados} meses
            </span>
          </div>

          <ResultCard
            total={resultado.totalLiquido}
            totalLabel="Voce tem direito a receber"
            items={items}
            shareText={shareText}
          />

          {/* Seguro-desemprego */}
          {resultado.temDireitoSeguroDesemprego && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
              <p className="text-yellow-200 font-bold text-sm">Seguro-desemprego</p>
              <p className="text-yellow-100 text-sm mt-1">
                Voce pode ter direito a {resultado.parcelasSeguro} parcelas de seguro-desemprego.
                Consulte o valor no portal Gov.br.
              </p>
            </div>
          )}

          <button
            onClick={() => setResultado(null)}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-2xl text-sm transition-all"
          >
            Calcular novamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular Rescisao">
      <div className="space-y-5">
        <MoneyInput
          label="Salario bruto mensal"
          value={salario}
          onChange={setSalario}
          placeholder="2.500,00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Data de admissao</label>
          <input
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Data de demissao/saida</label>
          <input
            type="date"
            value={dataDemissao}
            onChange={(e) => setDataDemissao(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de rescisao</label>
          <div className="grid grid-cols-2 gap-2">
            {tipos.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  tipo === t.value
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                <span className="block font-bold text-sm">{t.label}</span>
                <span className={`block text-xs mt-0.5 ${
                  tipo === t.value ? 'text-green-100' : 'text-white/40'
                }`}>
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFeriasVencidas(!feriasVencidas)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              feriasVencidas
                ? 'bg-green-500 border-green-500'
                : 'border-white/30'
            }`}
          >
            {feriasVencidas && <span className="text-white text-xs font-bold">&#10003;</span>}
          </button>
          <label
            onClick={() => setFeriasVencidas(!feriasVencidas)}
            className="text-white/70 text-sm cursor-pointer"
          >
            Tenho ferias vencidas (nao tiradas)
          </label>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        <button
          onClick={calcular}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-xl transition-all shadow-lg shadow-green-500/20"
        >
          CALCULAR
        </button>
      </div>
    </Layout>
  );
}
