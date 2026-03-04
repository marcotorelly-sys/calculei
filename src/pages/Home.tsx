import { Link } from 'react-router-dom';

const calculadoras = [
  {
    icon: '📋',
    title: 'Rescisão',
    desc: 'Quanto você recebe se for demitido ou pedir demissão',
    path: '/rescisao',
    featured: true,
  },
  {
    icon: '🏖️',
    title: 'Férias',
    desc: 'Calcule quanto vai receber nas férias',
    path: '/ferias',
  },
  {
    icon: '🎄',
    title: '13º Salário',
    desc: 'Valor do 13º proporcional ou integral',
    path: '/13-salario',
  },
  {
    icon: '💵',
    title: 'Salário Líquido',
    desc: 'Descubra seu salário com descontos de INSS e IR',
    path: '/salario-liquido',
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="mx-auto max-w-lg">
        {/* Hero */}
        <div className="px-4 pt-10 pb-6 text-center">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-white text-3xl font-black mb-2">Calculei</h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs mx-auto">
            Descubra <span className="text-white font-bold">exatamente</span> quanto você tem direito a receber.
          </p>
        </div>

        {/* Calculadoras */}
        <div className="px-4 space-y-3 pb-6">
          {calculadoras.map((calc) => (
            <Link
              key={calc.path}
              to={calc.path}
              className={`block rounded-2xl p-4 transition-all active:scale-[0.98] ${
                calc.featured
                  ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/20'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{calc.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base text-white">
                    {calc.title}
                  </h2>
                  <p className={`text-sm leading-snug ${
                    calc.featured ? 'text-green-100' : 'text-white/60'
                  }`}>
                    {calc.desc}
                  </p>
                </div>
                <span className="text-white/40 text-xl flex-shrink-0">›</span>
              </div>
              {calc.featured && (
                <div className="mt-2.5 bg-white/20 rounded-full px-3 py-1 inline-block">
                  <span className="text-white text-xs font-semibold">⭐ Mais usado</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Info banner */}
        <div className="px-4 pb-4">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-white/50 text-sm">
              Atualizado com as tabelas <span className="text-white font-semibold">2026</span>
            </p>
            <p className="text-white/30 text-xs mt-1">
              INSS, IRRF e nova isenção de IR até R$ 5.000
            </p>
          </div>
        </div>

        {/* Premium teaser — emocional */}
        <div className="px-4 pb-6">
          <Link to="/premium" className="block bg-gradient-to-br from-amber-500/15 to-orange-600/15 border border-amber-500/25 rounded-2xl p-5 transition-all hover:from-amber-500/25 hover:to-orange-600/25 active:scale-[0.98]">
            <div className="text-center space-y-2">
              <p className="text-amber-100 font-black text-base leading-snug">
                Será que você está recebendo tudo certo?
              </p>
              <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto">
                Checklist do TRCT, comparador de cenários e relatório PDF para levar ao RH ou advogado.
              </p>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl mt-1">
                <span className="text-amber-300 font-bold text-sm">Conhecer Premium</span>
                <span className="text-amber-400/70 text-xs">R$ 4,90/mês</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/30 text-xs pb-8 px-4 space-y-1">
          <p>Simulação estimativa. Consulte um profissional.</p>
          <p>© Calculei 2026</p>
        </footer>
      </div>
    </div>
  );
}
