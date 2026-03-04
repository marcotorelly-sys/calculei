import {
  calcularRescisao, formatarMoeda, labelTipoRescisao,
  type TipoRescisao, type ResultadoRescisao
} from '../lib/calculos';

interface Props {
  salarioBruto: number;
  dataAdmissao: string;
  dataDemissao: string;
  tipoAtual: TipoRescisao;
  feriasVencidas: boolean;
}

const TODOS_TIPOS: TipoRescisao[] = ['sem_justa_causa', 'pedido_demissao', 'acordo', 'justa_causa'];

export default function ComparadorCenarios({ salarioBruto, dataAdmissao, dataDemissao, tipoAtual, feriasVencidas }: Props) {
  // Calcular todos os cenários
  const cenarios: { tipo: TipoRescisao; resultado: ResultadoRescisao }[] = TODOS_TIPOS.map((tipo) => ({
    tipo,
    resultado: calcularRescisao({
      salarioBruto,
      dataAdmissao,
      dataDemissao,
      tipoRescisao: tipo,
      feriasVencidas,
    }),
  }));

  // Encontrar o maior valor para highlight
  const maxValor = Math.max(...cenarios.map(c => c.resultado.totalLiquido));

  // Cenário atual
  const cenarioAtual = cenarios.find(c => c.tipo === tipoAtual)!;
  const outrosCenarios = cenarios.filter(c => c.tipo !== tipoAtual);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">⚖️</span>
        <h3 className="text-white font-bold text-sm">Comparador de Cenários</h3>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold ml-auto">Premium</span>
      </div>

      {/* Cenário atual (destaque) */}
      <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-300 text-[10px] font-semibold uppercase tracking-wider">Seu cenário</p>
            <p className="text-white text-sm font-bold mt-0.5">{labelTipoRescisao(cenarioAtual.tipo)}</p>
          </div>
          <p className="text-green-300 text-lg font-black font-mono">
            {formatarMoeda(cenarioAtual.resultado.totalLiquido)}
          </p>
        </div>
      </div>

      {/* Outros cenários */}
      <div className="space-y-2">
        {outrosCenarios.map(({ tipo, resultado }) => {
          const diff = resultado.totalLiquido - cenarioAtual.resultado.totalLiquido;
          const isMaior = resultado.totalLiquido === maxValor && diff > 0;

          return (
            <div key={tipo} className={`rounded-xl p-3.5 ${
              isMaior
                ? 'bg-amber-500/10 border border-amber-500/20'
                : 'bg-white/5 border border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{labelTipoRescisao(tipo)}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-white text-sm font-bold font-mono">
                    {formatarMoeda(resultado.totalLiquido)}
                  </p>
                  <p className={`text-[11px] font-semibold ${
                    diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/40'
                  }`}>
                    {diff > 0 ? '+' : ''}{formatarMoeda(diff)}
                  </p>
                </div>
              </div>

              {/* Mini detalhamento */}
              <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-x-3 gap-y-1">
                {resultado.avisoPrevio > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-[10px]">Aviso prévio</span>
                    <span className="text-white/60 text-[10px] font-mono">{formatarMoeda(resultado.avisoPrevio)}</span>
                  </div>
                )}
                {resultado.multaFGTS > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-[10px]">Multa FGTS</span>
                    <span className="text-white/60 text-[10px] font-mono">{formatarMoeda(resultado.multaFGTS)}</span>
                  </div>
                )}
                {resultado.feriasProporcional > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-[10px]">Férias prop.</span>
                    <span className="text-white/60 text-[10px] font-mono">{formatarMoeda(resultado.feriasProporcional)}</span>
                  </div>
                )}
                {resultado.decimoTerceiro > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-[10px]">13º prop.</span>
                    <span className="text-white/60 text-[10px] font-mono">{formatarMoeda(resultado.decimoTerceiro)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      {(() => {
        const melhorCenario = cenarios.reduce((a, b) =>
          a.resultado.totalLiquido > b.resultado.totalLiquido ? a : b
        );
        if (melhorCenario.tipo !== tipoAtual) {
          const diff = melhorCenario.resultado.totalLiquido - cenarioAtual.resultado.totalLiquido;
          return (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
              <p className="text-amber-200 text-xs leading-relaxed">
                <span className="font-bold">💡 Insight:</span> Se fosse{' '}
                <span className="font-bold">{labelTipoRescisao(melhorCenario.tipo).toLowerCase()}</span>,
                você receberia <span className="font-bold text-amber-300">{formatarMoeda(diff)} a mais</span>.
                Leve essa informação ao seu advogado ou RH.
              </p>
            </div>
          );
        }
        return (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3.5">
            <p className="text-green-200 text-xs leading-relaxed">
              <span className="font-bold">✅ Boa notícia:</span> O seu cenário atual já é o que rende o maior valor líquido.
            </p>
          </div>
        );
      })()}
    </div>
  );
}
