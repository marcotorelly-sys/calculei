import { useState } from 'react';
import { formatarMoeda, type TipoRescisao, type ResultadoRescisao } from '../lib/calculos';

interface Props {
  resultado: ResultadoRescisao;
}

interface CheckItem {
  id: string;
  label: string;
  desc: string;
  valor?: number;
  aplicavel: boolean;
}

function getChecklistItems(r: ResultadoRescisao): CheckItem[] {
  const tipo = r.tipoRescisao;

  const items: CheckItem[] = [
    {
      id: 'saldo_salario',
      label: 'Saldo de salário',
      desc: `${r.diasTrabalhadosMes} dias trabalhados no mês da saída`,
      valor: r.saldoSalario,
      aplicavel: true,
    },
    {
      id: 'aviso_previo',
      label: 'Aviso prévio indenizado',
      desc: tipo === 'acordo'
        ? `50% de ${r.diasAvisoPrevio} dias (acordo Art. 484-A)`
        : `${r.diasAvisoPrevio} dias (30 + 3 por ano de serviço)`,
      valor: r.avisoPrevio,
      aplicavel: tipo === 'sem_justa_causa' || tipo === 'acordo',
    },
    {
      id: 'ferias_prop',
      label: 'Férias proporcionais',
      desc: 'Meses trabalhados no período aquisitivo atual',
      valor: r.feriasProporcional,
      aplicavel: tipo !== 'justa_causa' && r.feriasProporcional > 0,
    },
    {
      id: 'ferias_vencidas',
      label: 'Férias vencidas (não tiradas)',
      desc: 'Período aquisitivo completo não gozado',
      valor: r.feriasVencidas,
      aplicavel: r.feriasVencidas > 0,
    },
    {
      id: 'terco',
      label: '1/3 constitucional',
      desc: 'Adicional de 1/3 sobre o total de férias',
      valor: r.tercoFerias,
      aplicavel: r.tercoFerias > 0,
    },
    {
      id: '13_prop',
      label: '13º salário proporcional',
      desc: 'Meses trabalhados no ano (jan até a saída)',
      valor: r.decimoTerceiro,
      aplicavel: tipo !== 'justa_causa' && r.decimoTerceiro > 0,
    },
    {
      id: 'multa_fgts',
      label: `Multa FGTS (${tipo === 'acordo' ? '20%' : '40%'})`,
      desc: tipo === 'acordo'
        ? '20% sobre o saldo do FGTS (acordo Art. 484-A)'
        : '40% sobre o saldo total do FGTS',
      valor: r.multaFGTS,
      aplicavel: (tipo === 'sem_justa_causa' || tipo === 'acordo') && r.multaFGTS > 0,
    },
    {
      id: 'saque_fgts',
      label: 'Saque do FGTS',
      desc: tipo === 'acordo'
        ? 'Direito a sacar 80% do saldo do FGTS'
        : 'Direito a sacar 100% do saldo do FGTS',
      aplicavel: tipo === 'sem_justa_causa' || tipo === 'acordo',
    },
    {
      id: 'seguro',
      label: 'Guias do Seguro-desemprego',
      desc: r.temDireitoSeguroDesemprego
        ? `Direito a ${r.parcelasSeguro} parcelas — confirme que recebeu as guias`
        : 'Não se aplica ao seu tipo de rescisão',
      aplicavel: r.temDireitoSeguroDesemprego,
    },
    {
      id: 'inss',
      label: 'Desconto INSS correto',
      desc: `Valor calculado: ${formatarMoeda(r.descontoINSS)} — confira no TRCT`,
      valor: r.descontoINSS,
      aplicavel: r.descontoINSS > 0,
    },
    {
      id: 'irrf',
      label: 'Desconto IRRF correto',
      desc: r.descontoIRRF > 0
        ? `Valor calculado: ${formatarMoeda(r.descontoIRRF)} — confira no TRCT`
        : 'Isento de IRRF',
      valor: r.descontoIRRF,
      aplicavel: true,
    },
    {
      id: 'prazo',
      label: 'Prazo de pagamento',
      desc: 'A empresa tem até 10 dias corridos após a demissão para pagar',
      aplicavel: true,
    },
    {
      id: 'homologacao',
      label: 'Homologação (se +1 ano)',
      desc: r.mesesTrabalhados >= 12
        ? 'Com mais de 1 ano, a rescisão deve ser homologada no sindicato'
        : 'Com menos de 1 ano, não precisa de homologação',
      aplicavel: r.mesesTrabalhados >= 12,
    },
  ];

  return items;
}

const alertas: Record<TipoRescisao, string[]> = {
  sem_justa_causa: [
    'Confira se o aviso prévio inclui os dias adicionais por ano trabalhado (3 dias/ano)',
    'Verifique se a multa do FGTS está calculada sobre TODO o saldo, não apenas sobre os últimos meses',
    'Peça as guias do seguro-desemprego ANTES de assinar o TRCT',
  ],
  pedido_demissao: [
    'No pedido de demissão, você NÃO tem direito a multa do FGTS, saque do FGTS ou seguro-desemprego',
    'Você pode negociar um acordo (Art. 484-A) que dá direito a 20% de multa e 80% de saque do FGTS',
  ],
  acordo: [
    'No acordo, a multa é de 20% (não 40%) e o saque do FGTS é limitado a 80%',
    'Não há direito a seguro-desemprego no acordo',
    'O aviso prévio indenizado é de 50% do valor normal',
  ],
  justa_causa: [
    'Na justa causa, você só tem direito ao saldo de salário e férias vencidas + 1/3',
    'Se discordar da justa causa, procure um advogado trabalhista — a reversão na Justiça pode garantir todos os direitos',
    'Guarde todos os documentos e provas relacionadas à demissão',
  ],
};

export default function ChecklistTRCT({ resultado }: Props) {
  const items = getChecklistItems(resultado);
  const aplicaveis = items.filter(i => i.aplicavel);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progresso = aplicaveis.length > 0 ? (totalChecked / aplicaveis.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header com progresso */}
      <div className="flex items-center gap-2">
        <span className="text-lg">✅</span>
        <h3 className="text-white font-bold text-sm">Checklist do TRCT</h3>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold ml-auto">Premium</span>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 rounded-full"
          style={{ width: `${progresso}%` }}
        />
      </div>
      <p className="text-white/40 text-xs text-center">
        {totalChecked} de {aplicaveis.length} itens verificados
      </p>

      {/* Alertas específicos */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
        <p className="text-amber-300 text-xs font-bold">⚠️ Atenção para {labelTipo(resultado.tipoRescisao)}:</p>
        {alertas[resultado.tipoRescisao].map((alerta, i) => (
          <p key={i} className="text-amber-200/70 text-[11px] leading-relaxed pl-3 border-l-2 border-amber-500/30">
            {alerta}
          </p>
        ))}
      </div>

      {/* Itens do checklist */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => item.aplicavel && toggle(item.id)}
            className={`rounded-xl p-3 transition-all ${
              !item.aplicavel
                ? 'bg-white/3 opacity-40'
                : checked[item.id]
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 active:scale-[0.99]'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                !item.aplicavel
                  ? 'border-white/10'
                  : checked[item.id]
                    ? 'bg-green-500 border-green-500'
                    : 'border-white/30'
              }`}>
                {checked[item.id] && <span className="text-white text-xs font-bold">✓</span>}
                {!item.aplicavel && <span className="text-white/20 text-xs">—</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${
                    checked[item.id] ? 'text-green-300 line-through' : item.aplicavel ? 'text-white' : 'text-white/40'
                  }`}>
                    {item.label}
                  </p>
                  {item.valor !== undefined && item.valor > 0 && (
                    <span className="text-white/50 text-xs font-mono flex-shrink-0">
                      {formatarMoeda(item.valor)}
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusão */}
      {progresso === 100 && (
        <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-green-300 font-bold text-sm mt-1">Checklist completo!</p>
          <p className="text-green-200/50 text-xs mt-1">
            Todos os itens aplicáveis foram verificados. Guarde este resultado como referência.
          </p>
        </div>
      )}
    </div>
  );
}

function labelTipo(tipo: TipoRescisao): string {
  const labels: Record<TipoRescisao, string> = {
    sem_justa_causa: 'demissão sem justa causa',
    pedido_demissao: 'pedido de demissão',
    acordo: 'acordo (Art. 484-A)',
    justa_causa: 'demissão por justa causa',
  };
  return labels[tipo];
}
