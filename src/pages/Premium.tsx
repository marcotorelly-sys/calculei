import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { usePremium } from '../contexts/PremiumContext';

// Link do Mercado Pago — Calculei Premium v1.0
const MERCADO_PAGO_LINK = 'https://mpago.la/2H8RhiR'; // Ativo

export default function Premium() {
  const { isPremium, email, ativarPremium, logout } = usePremium();
  const [inputEmail, setInputEmail] = useState('');
  const [etapa, setEtapa] = useState<'info' | 'email' | 'aguardando'>('info');
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState('');

  // Se já é premium, mostra status
  if (isPremium) {
    return (
      <Layout title="Calculei Premium">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-center shadow-lg">
            <span className="text-4xl">👑</span>
            <h2 className="text-white text-2xl font-black mt-2">Você é Premium!</h2>
            <p className="text-amber-100 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Todas as funcionalidades estão desbloqueadas.
            </p>
            {email && (
              <p className="text-amber-200/60 text-xs mt-3">{email}</p>
            )}
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
            <p className="text-green-300 font-bold text-sm">✅ Funcionalidades ativas:</p>
            <div className="space-y-2">
              {[
                '⚖️ Comparador de cenários lado a lado',
                '📄 Relatório PDF profissional',
                '✅ Checklist interativo do TRCT',
              ].map((item, i) => (
                <p key={i} className="text-green-200/70 text-sm pl-2">{item}</p>
              ))}
            </div>
          </div>

          <Link
            to="/rescisao"
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-center text-base transition-all shadow-lg"
          >
            Calcular Rescisão com Premium
          </Link>

          <Link
            to="/"
            className="block w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-medium py-3 rounded-2xl text-center text-sm transition-all"
          >
            ← Voltar para as calculadoras
          </Link>

          <button
            onClick={logout}
            className="w-full text-white/30 text-xs text-center py-2 hover:text-white/50 transition-colors"
          >
            Sair da conta Premium
          </button>
        </div>
      </Layout>
    );
  }

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
  ];

  const validarEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handlePagar = () => {
    if (!validarEmail(inputEmail)) {
      setErro('Digite um email válido');
      return;
    }
    setErro('');
    // Salvar email localmente antes de redirecionar
    localStorage.setItem('calculei_premium_email', inputEmail.toLowerCase().trim());
    // Redirecionar para Mercado Pago
    window.open(MERCADO_PAGO_LINK, '_blank');
    // Mudar para tela de "aguardando"
    setEtapa('aguardando');
  };

  const handleVerificar = async () => {
    const emailParaVerificar = inputEmail || localStorage.getItem('calculei_premium_email') || '';
    if (!emailParaVerificar) {
      setErro('Nenhum email encontrado');
      return;
    }

    setVerificando(true);
    setErro('');

    const resultado = await ativarPremium(emailParaVerificar);

    if (resultado) {
      // Premium ativado!
    } else {
      setErro('Pagamento ainda não confirmado. Pode levar alguns minutos após o Pix ser processado.');
    }

    setVerificando(false);
  };

  // Tela de aguardando pagamento
  if (etapa === 'aguardando') {
    return (
      <Layout title="Calculei Premium">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6 text-center">
            <span className="text-4xl">⏳</span>
            <h2 className="text-white text-xl font-black mt-2">Aguardando pagamento</h2>
            <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Complete o pagamento via Pix no Mercado Pago e depois clique em verificar.
            </p>
            {inputEmail && (
              <p className="text-amber-300/60 text-xs mt-3">{inputEmail}</p>
            )}
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 text-sm text-center">{erro}</p>
            </div>
          )}

          <button
            onClick={handleVerificar}
            disabled={verificando}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg"
          >
            {verificando ? 'Verificando...' : 'Já paguei — Verificar'}
          </button>

          <a
            href={MERCADO_PAGO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 active:scale-[0.98] text-blue-300 font-medium py-3 rounded-2xl text-center text-sm transition-all"
          >
            Abrir Mercado Pago novamente
          </a>

          <button
            onClick={() => setEtapa('info')}
            className="w-full text-white/40 text-xs text-center py-2 hover:text-white/60 transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </Layout>
    );
  }

  // Tela de coleta de email
  if (etapa === 'email') {
    return (
      <Layout title="Calculei Premium">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-center shadow-lg">
            <span className="text-4xl">📧</span>
            <h2 className="text-white text-xl font-black mt-2">Informe seu email</h2>
            <p className="text-amber-100 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Usaremos para ativar seu Premium após o pagamento. Nada de spam.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Seu email</label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => { setInputEmail(e.target.value); setErro(''); }}
              placeholder="seu@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              autoFocus
            />
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 text-sm text-center">{erro}</p>
            </div>
          )}

          <button
            onClick={handlePagar}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg shadow-amber-500/30"
          >
            Pagar R$ 4,90/mês via Pix
          </button>

          <p className="text-white/30 text-xs text-center">
            Pagamento seguro via Mercado Pago. Cancele quando quiser.
          </p>

          {/* Já pagou? */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-2">
            <p className="text-white/50 text-sm">Já pagou e quer ativar?</p>
            <button
              onClick={() => {
                if (!validarEmail(inputEmail)) {
                  setErro('Digite seu email primeiro');
                  return;
                }
                setEtapa('aguardando');
              }}
              className="text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors"
            >
              Verificar pagamento →
            </button>
          </div>

          <button
            onClick={() => setEtapa('info')}
            className="w-full text-white/40 text-xs text-center py-2 hover:text-white/60 transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </Layout>
    );
  }

  // Tela principal (info)
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

        {/* Botão principal */}
        <button
          onClick={() => setEtapa('email')}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-center text-lg transition-all shadow-lg shadow-amber-500/30"
        >
          Assinar Premium — R$ 4,90/mês
        </button>

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
