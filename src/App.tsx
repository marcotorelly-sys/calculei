import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PremiumProvider } from './contexts/PremiumContext';
import Home from './pages/Home';
import Rescisao from './pages/Rescisao';
import Ferias from './pages/Ferias';
import DecimoTerceiro from './pages/DecimoTerceiro';
import SalarioLiquido from './pages/SalarioLiquido';
import Premium from './pages/Premium';

const APP_VERSION = '2.0.0';

export default function App() {
  if (typeof window !== 'undefined') (window as any).__CALCULEI_VERSION__ = APP_VERSION;
  return (
    <BrowserRouter>
      <PremiumProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rescisao" element={<Rescisao />} />
            <Route path="/ferias" element={<Ferias />} />
            <Route path="/13-salario" element={<DecimoTerceiro />} />
            <Route path="/salario-liquido" element={<SalarioLiquido />} />
            <Route path="/premium" element={<Premium />} />
          </Routes>
        </div>
      </PremiumProvider>
    </BrowserRouter>
  );
}
