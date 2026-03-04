import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MoneyInput from '../components/MoneyInput';
import ResultCard from '../components/ResultCard';
import ComparadorCenarios from '../components/ComparadorCenarios';
import ChecklistTRCT from '../components/ChecklistTRCT';
import BotaoRelatorioPDF from '../components/RelatorioPDF';
import { usePremium } from '../contexts/PremiumContext';
import {
  calcularRescisao, formatarMoeda, labelTipoRescisao,
  type TipoRescisao, type ResultadoRescisao
} from '../lib/calculos';

const tipos: { value: TipoRescisao; label: string; desc: string }[] = [
  { value: 'sem_justa_causa', label: 'Fui demitido', desc: 'Sem justa causa' },
  { value: 'pedido_demissao', label: 'Pedi demissão', desc: 'Pedido voluntário' },
  { value: 'acordo', label: 'Acordo', desc: 'Art. 484-A CLT' },
  { value: 'justa_causa', label: 'Justa causa', desc: 'Falta grave' },
];

export default function Rescisao() {
  const { isPremium } = usePremium();
  const [salario, setSalario] = useState(0);
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDemissao, setDataDemissao] = useState('');
  const [tipo, setTipo] = useState<TipoRescisao>('sem_justa_causa');
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [resultado, setResultado] = useState<ResultadoRescisao | null>(null);
  const [erro, setErro] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'resultado' | 'comparador' | 'checklist'>('resultado');

  const calcular = () => {
    setErro('');
    if (!salario || salario <= 0) {
      setErro('Informe seu salário bruto');
      return;
    }
    if (!dataAdmissao) {
      setErro('Informe a data de admissão');
      return;
    }
    if (!dataDemissao) {
      setErro('Informe a data de demissão/saída');
      return;
    }
    if (new Date(dataDemissao) <= new Date(dataAdmissao)) {
      setErro('A data de saída deve ser posterior à admissão');
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
    setAbaAtiva('resultado');
  };

  // CTAs contextuais por tipo de rescisão
  const premiumCTAs: Record<TipoRescisao, { emoji: string; titulo: string; texto: string; alerta?: string }> = {
    sem_justa_causa: {
      emoji: '⚠️',
      titulo: 'Será que sua rescisão está correta?',
      texto: 'Compare item por item com o checklist do TRCT. 40% dos trabalhadores recebem menos do que deveriam.',
      alerta: '40% dos TRCTs contêm erros. Confira o seu antes de assinar.',
    },
    pedido_demissao: {
      emoji: '🤔',
      titulo: 'E se você negociasse um acordo?',
      texto: 'Com o comparador de cenários, veja lado a lado quanto receberia em cada modalidade. Você pode estar deixando dinheiro na mesa.',
    },
    acordo: {
      emoji: '📊',
      titulo: 'Esse acordo é justo?',
      texto: 'Compare com a demissão sem justa causa e veja a diferença real. Leve um relatório profissional para a negociação.',
      alerta: 'Antes de aceitar, compare: quanto seria sem justa causa?',
    },
    justa_causa: {
      emoji: '⚖️',
      titulo: 'Justa causa pode ser revertida',
      texto: 'Veja quanto você receberia se a justa causa for derrubada na Justiça. Leve o relatório comparativo para seu advogado.',
      alerta: 'Se a justa causa for revertida, você pode receber muito mais.',
    },
  };

  if (resultado) {
    const items = [
      { label: 'Saldo de salário', value: resultado.saldoSalario },
      ...(resultado.avisoPrevio > 0 ? [{
        label: `Aviso prévio (${resultado.diasAvisoPrevio} dias)`,
        value: resultado.avisoPrevio
      }] : []),
      ...(resultado.feriasProporcional > 0 ? [{
        label: 'Férias proporcionais',
        value: resultado.feriasProporcional
      }] : []),
      ...(resultado.feriasVencidas > 0 ? [{
        label: 'Férias vencidas',
        value: resultado.feriasVencidas
      }] : []),
      ...(resultado.tercoFerias > 0 ? [{
        label: '1/3 constitucional',
        value: resultado.tercoFerias
      }] : []),
      ...(resultado.decimoTerceiro > 0 ? [{
        label: '13º proporcional',
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

    const shareText = `Fiz uma simulação de rescisão e descobri que tenho direito a receber ${formatarMoeda(resultado.totalLiquido)}! (${labelTipoRescisao(resultado.tipoRescisao)}, ${resultado.mesesTrabalhados} meses)`;

    // Cenários alternativos para teaser trancado (só se NÃO premium)
    const outrosCenarios = (['sem_justa_causa', 'pedido_demissao', 'acordo', 'justa_causa'] as TipoRescisao[])
      .filter(t => t !== resultado.tipoRescisao)
      .slice(0, 2);

    return (
      <Layout title="Resultado da Rescisão">
        <div className="space-y-4">
          {/* Info tipo */}
          <div className="bg-white/5 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-white/50 text-sm">
              {labelTipoRescisao(resultado.tipoRescisao)} · {resultado.mesesTrabalhados} meses
            </span>
            {isPremium && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold ml-auto">
                👑 Premium
              </span>
            )}
          </div>

          {/* Abas Premium */}
          {isPremium && (
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              {([
                { key: 'resultado' as const, label: '📊 Resultado' },
                { key: 'comparador' as const, label: '⚖️ Cenários' },
                { key: 'checklist' as const, label: '✅ Checklist' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAbaAtiva(key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    abaAtiva === key
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Conteúdo da aba ativa */}
          {abaAtiva === 'resultado' && (
            <>
              <ResultCard
                total={resultado.totalLiquido}
                totalLabel="Você tem direito a receber"
                items={items}
                shareText={shareText}
                premiumCTA={isPremium ? undefined : premiumCTAs[resultado.tipoRescisao]}
              />

              {/* Teaser comparação de cenários (trancado) — só para não-premium */}
              {!isPremium && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🔒</span>
                    <h3 className="text-white/80 text-sm font-bold">Comparar cenários</h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold ml-auto">Premium</span>
                  </div>
                  <div className="space-y-2 opacity-50 blur-[2px] select-none pointer-events-none">
                    {outrosCenarios.map((t) => (
                      <div key={t} className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2.5">
                        <span className="text-white/70 text-xs">{labelTipoRescisao(t)}</span>
                        <span className="text-white font-mono text-sm">R$ •.•••,••</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/premium"
                    className="mt-3 block text-center text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors"
                  >
                    Desbloquear comparação →
                  </Link>
                </div>
              )}

              {/* Botão PDF — só para premium */}
              {isPremium && (
                <BotaoRelatorioPDF
                  resultado={resultado}
                  salarioBruto={salario}
                  dataAdmissao={dataAdmissao}
                  dataDemissao={dataDemissao}
                  feriasVencidas={feriasVencidas}
                />
              )}
            </>
          )}

          {abaAtiva === 'comparador' && isPremium && (
            <ComparadorCenarios
              salarioBruto={salario}
              dataAdmissao={dataAdmissao}
              dataDemissao={dataDemissao}
              tipoAtual={resultado.tipoRescisao}
              feriasVencidas={feriasVencidas}
            />
          )}

          {abaAtiva === 'checklist' && isPremium && (
            <ChecklistTRCT resultado={resultado} />
          )}

          {/* Seguro-desemprego */}
          {resultado.temDireitoSeguroDesemprego && abaAtiva === 'resultado' && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
              <p className="text-yellow-200 font-bold text-sm">📋 Seguro-desemprego</p>
              <p className="text-yellow-100 text-sm mt-1 leading-relaxed">
                Você pode ter direito a {resultado.parcelasSeguro} parcelas de seguro-desemprego.
                Consulte o valor no portal Gov.br.
              </p>
            </div>
          )}

          <button
            onClick={() => setResultado(null)}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl text-sm transition-all"
          >
            ← Calcular novamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Calcular Rescisão">
      <div className="space-y-5">
        <MoneyInput
          label="Salário bruto mensal"
          value={salario}
          onChange={setSalario}
          placeholder="2.500,00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Data de admissão</label>
          <input
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Data de demissão/saída</label>
          <input
            type="date"
            value={dataDemissao}
            onChange={(e) => setDataDemissao(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2.5">Tipo de rescisão</label>
          <div className="grid grid-cols-2 gap-2">
            {tipos.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  tipo === t.value
                    ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-400/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                <span className="block font-bold text-sm leading-tight">{t.label}</span>
                <span className={`block text-[11px] mt-0.5 leading-tight ${
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
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              feriasVencidas
                ? 'bg-green-500 border-green-500'
                : 'border-white/30'
            }`}
          >
            {feriasVencidas && <span className="text-white text-xs font-bold">✓</span>}
          </button>
          <label
            onClick={() => setFeriasVencidas(!feriasVencidas)}
            className="text-white/70 text-sm cursor-pointer select-none"
          >
            Tenho férias vencidas (não tiradas)
          </label>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        <button
          onClick={calcular}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl text-lg transition-all shadow-lg shadow-green-500/20"
        >
          CALCULAR RESCISÃO
        </button>
      </div>
    </Layout>
  );
}
