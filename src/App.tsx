import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Rescisao from './pages/Rescisao';
import Ferias from './pages/Ferias';
import DecimoTerceiro from './pages/DecimoTerceiro';
import SalarioLiquido from './pages/SalarioLiquido';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rescisao" element={<Rescisao />} />
          <Route path="/ferias" element={<Ferias />} />
          <Route path="/13-salario" element={<DecimoTerceiro />} />
          <Route path="/salario-liquido" element={<SalarioLiquido />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
