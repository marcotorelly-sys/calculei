import { Link } from 'react-router-dom';
import { formatarMoeda } from '../lib/calculos';

interface LineItem {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}

interface PremiumCTA {
  emoji: string;
  titulo: string;
  texto: string;
  alerta?: string;
}

export default function ResultCard({ total, totalLabel, items, shareText, premiumCTA }: {
  total: number;
  totalLabel: string;
  items: LineItem[];
  shareText: string;
  premiumCTA?: PremiumCTA;
}) {

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `${shareText}\n\nDescubra o seu: https://calculei.net`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${shareText}\n\nDescubra o seu: https://calculei.net`
    );
  };

  return (
    <div className="space-y-4">
      {/* Total principal */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-center shadow-lg">
        <p className="text-green-100 text-sm font-medium mb-1">{totalLabel}</p>
        <p className="text-white text-3xl sm:text-4xl font-black tracking-tight break-words">
          {formatarMoeda(total)}
        </p>
      </div>

      {/* Detalhamento */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-3">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          Detalhamento
        </h3>
        {items.map((item, i) => (
          <div key={i} className={`flex justify-between items-center gap-2 ${
            item.highlight ? 'border-t border-white/10 pt-3 mt-3' : ''
          }`}>
            <span className={`text-sm flex-1 ${item.highlight ? 'text-white font-bold' : 'text-white/70'}`}>
              {item.label}
            </span>
            <span className={`text-sm font-mono whitespace-nowrap ${
              item.negative ? 'text-red-400' :
              item.highlight ? 'text-white font-bold' :
              'text-white'
            }`}>
              {item.negative ? '- ' : ''}{formatarMoeda(Math.abs(item.value))}
            </span>
          </div>
        ))}
      </div>

      {/* Alerta contextual (se houver) */}
      {premiumCTA?.alerta && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 text-center">
          <p className="text-red-200 text-sm font-bold leading-relaxed">
            {premiumCTA.alerta}
          </p>
        </div>
      )}

      {/* Premium CTA — contextual (só para não-premium) */}
      {premiumCTA && (
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-5">
          <div className="text-center space-y-3">
            <span className="text-3xl">{premiumCTA.emoji}</span>
            <p className="text-amber-100 font-black text-base leading-snug">
              {premiumCTA.titulo}
            </p>
            <p className="text-amber-100/60 text-xs leading-relaxed max-w-xs mx-auto">
              {premiumCTA.texto}
            </p>
            <Link
              to="/premium"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/25"
            >
              Quero conferir — R$ 4,90/mês
            </Link>
            <p className="text-amber-200/40 text-[10px]">
              Cancele quando quiser. Sem compromisso.
            </p>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="space-y-3">
        <button
          onClick={handleShareWhatsApp}
          className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Compartilhar no WhatsApp
        </button>

        <button
          onClick={handleCopy}
          className="w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-medium py-3 rounded-2xl text-sm transition-all"
        >
          Copiar resultado
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-white/30 text-xs text-center leading-relaxed">
        Simulação estimativa com base na CLT vigente e tabelas 2026.
        Para valores exatos, consulte um contador ou advogado trabalhista.
        O Calculei não substitui orientação profissional.
      </p>
    </div>
  );
}
