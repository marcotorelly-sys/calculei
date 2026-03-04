import { Link } from 'react-router-dom';

export default function Layout({ children, title, showBack = true }: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <header className="px-4 pt-4 pb-2 flex items-center gap-3">
          {showBack && (
            <Link to="/" className="text-white/80 hover:text-white p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-all active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-white font-bold text-lg">Calculei</span>
          </Link>
        </header>

        {title && (
          <div className="px-4 pb-4">
            <h1 className="text-white text-xl font-bold">{title}</h1>
          </div>
        )}

        {/* Content */}
        <main className="px-4 pb-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center text-white/40 text-xs pb-8 px-4 space-y-1">
          <p>Simulação estimativa com base na CLT vigente.</p>
          <p>Consulte um contador ou advogado para valores exatos.</p>
        </footer>
      </div>
    </div>
  );
}
