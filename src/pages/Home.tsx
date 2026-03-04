import { Link } from 'react-router-dom';

const calculadoras = [
  {
    icon: '📋',
    title: 'Rescisao',
    desc: 'Quanto voce recebe se for demitido ou pedir demissao',
    path: '/rescisao',
    featured: true,
  },
  {
    icon: '🏖️',
    title: 'Ferias',
    desc: 'Calcule quanto vai receber nas ferias',
    path: '/ferias',
  },
  {
    icon: '🎄',
    title: '13o Salario',
    desc: 'Valor do 13o proporcional ou integral',
    path: '/13-salario',
  },
  {
    icon: '💵',
    title: 'Salario Liquido',
    desc: 'Descubra seu salario com descontos de INSS e IR',
    path: '/salario-liquido',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      {/* Hero */}
      <div className="px-4 pt-12 pb-8 text-center">
        <div className="text-5xl mb-4">💰</div>
        <h1 className="text-white text-3xl font-black mb-2">Calculei</h1>
        <p className="text-blue-200 text-lg leading-relaxed max-w-xs mx-auto">
          Descubra <span className="text-white font-bold">exatamente</span> quanto voce tem direito a receber.
        </p>
      </div>

      {/* Calculadoras */}
      <div className="px-4 space-y-3 pb-8">
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
            <div className="flex items-center gap-4">
              <span className="text-3xl">{calc.icon}</span>
              <div className="flex-1">
                <h2 className={`font-bold text-lg ${
                  calc.featured ? 'text-white' : 'text-white'
                }`}>
                  {calc.title}
                </h2>
                <p className={`text-sm ${
                  calc.featured ? 'text-green-100' : 'text-white/60'
                }`}>
                  {calc.desc}
                </p>
              </div>
              <span className="text-white/40 text-2xl">&rsaquo;</span>
            </div>
            {calc.featured && (
              <div className="mt-3 bg-white/20 rounded-full px-3 py-1 inline-block">
                <span className="text-white text-xs font-semibold">Mais usado</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Social proof */}
      <div className="px-4 pb-6">
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <p className="text-white/50 text-sm">
            Atualizado com as tabelas <span className="text-white font-semibold">2026</span>
          </p>
          <p className="text-white/30 text-xs mt-1">
            INSS, IRRF e nova isencao de IR ate R$5.000
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white/30 text-xs pb-8 px-4 space-y-1">
        <p>Simulacao estimativa. Consulte um profissional.</p>
        <p>Calculei 2026</p>
      </footer>
    </div>
  );
}
