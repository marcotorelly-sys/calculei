import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Link do Mercado Pago — Calculei Premium v1.0
const MERCADO_PAGO_LINK = 'https://mpago.la/2H8RhiR'; // Ativo

export default function Premium() {
  const hasPaymentLink = MERCADO_PAGO_LINK.length > 0;

  const recursos = [
    {
      icon: '📄',
      title: 'Relatório PDF profissional',
      desc: 'Gere um PDF detalhado com todos os cálculos para levar ao RH ou advogado',
    },
    {
      icon: '⚖️',
      title: 'Comparador de cenários',
      desc: 'Compare demissão sem justa causa vs. acordo vs. pedido de demissão lado a lado',
    },
    {
      icon: '✅',
      title: 'Checklist do TRCT',
      desc: 'Confira item por item se sua rescisão está correta antes de assinar',
    },
    {
      icon: '⏰',
      title: 'Calculadora de horas extras',
      desc: 'Calcule quanto você deve receber de horas extras, adicional noturno e DSR',
    },
    {
      icon: '📊',
      title: 'Histórico de cálculos',
      desc: 'Salve e compare seus cálculos anteriores para acompanhar mudanças',
    },
    {
      icon: '🔔',
      title: 'Alertas de mudança na lei',
      desc: 'Receba notificação quando tabelas de INSS ou IRRF forem atualizadas',
    },
  ];

  return (
    <Layout title="Calculei Premium">
      <div className="space-y-5">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-center shadow-lg">
          <span className="text-4xl">🚀</span>
          <h2 className="text-white text-2xl font-black mt-2">Calculei Premium</h2>
          <p className="text-amber-100 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
            Tudo que você precisa para garantir que seus direitos estão sendo respeitados.
          </p>
          <div className="mt-4 bg-white/20 rounded-xl p-3 inline-block">
            <span className="text-white text-3xl font-black">R$ 4,90</span>
            <span className="text-amber-100 text-sm">/mês</span>
          </div>
        </div>

        {/* Recursos */}
        <div className="space-y-3">
          {recursos.map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{item.title}</p>
                <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <span className="text-xl">🛡️</span>
          <p className="text-green-300 font-bold text-sm mt-1">7 dias de garantia</p>
          <p className="text-green-200/50 text-xs mt-0.5">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>

        {/* Botão de pagamento */}
        {hasPaymentLink ? (
          <a
            href={MERCADO_PAGO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-center text-lg transition-all shadow-lg shadow-amber-500/30"
          >
            Assinar Premium — R$ 4,90/mês
          </a>
        ) : (
          <div className="w-full bg-amber-500/30 text-amber-200 font-bold py-4 rounded-2xl text-center text-base">
            Em breve — R$ 4,90/mês
          </div>
        )}

        {/* Métodos aceitos */}
        <p className="text-white/30 text-xs text-center">
          Pagamento seguro via Mercado Pago. PIX, cartão de crédito e boleto.
        </p>

        {/* Voltar */}
        <Link
          to="/"
          className="block w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-medium py-3 rounded-2xl text-center text-sm transition-all"
        >
          ← Voltar para as calculadoras
        </Link>
      </div>
    </Layout>
  );
}
