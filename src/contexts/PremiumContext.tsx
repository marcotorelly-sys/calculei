import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { verificarPremium } from '../lib/supabase';

interface PremiumContextType {
  isPremium: boolean;
  email: string | null;
  loading: boolean;
  ativarPremium: (email: string) => Promise<boolean>;
  verificarStatus: () => Promise<void>;
  logout: () => void;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  email: null,
  loading: true,
  ativarPremium: async () => false,
  verificarStatus: async () => {},
  logout: () => {},
});

const STORAGE_KEY = 'calculei_premium_email';
const PREMIUM_CACHE_KEY = 'calculei_premium_status';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar status no Supabase
  const verificarStatus = useCallback(async () => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (!storedEmail) {
      setIsPremium(false);
      setEmail(null);
      setLoading(false);
      return;
    }

    setEmail(storedEmail);

    // Checar cache local primeiro
    const cached = localStorage.getItem(PREMIUM_CACHE_KEY);
    if (cached) {
      try {
        const { premium, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setIsPremium(premium);
          setLoading(false);
          // Verificar em background (só atualiza se Supabase respondeu)
          verificarPremium(storedEmail).then((result) => {
            if (result !== null) { // null = Supabase offline/não configurado
              setIsPremium(result);
              localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({
                premium: result,
                timestamp: Date.now(),
              }));
            }
          }).catch(() => {});
          return;
        }
      } catch { /* cache inválido */ }
    }

    // Verificar no Supabase
    try {
      const result = await verificarPremium(storedEmail);
      if (result !== null) {
        setIsPremium(result);
        localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({
          premium: result,
          timestamp: Date.now(),
        }));
      }
    } catch {
      // Offline — manter status anterior
    }

    setLoading(false);
  }, []);

  // Ativar premium com email (salva e verifica)
  const ativarPremium = useCallback(async (newEmail: string): Promise<boolean> => {
    const cleanEmail = newEmail.toLowerCase().trim();
    localStorage.setItem(STORAGE_KEY, cleanEmail);
    setEmail(cleanEmail);

    try {
      const result = await verificarPremium(cleanEmail);
      if (result !== null) {
        setIsPremium(result);
        localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({
          premium: result,
          timestamp: Date.now(),
        }));
        return result;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREMIUM_CACHE_KEY);
    setIsPremium(false);
    setEmail(null);
  }, []);

  // Verificar ao carregar
  useEffect(() => {
    verificarStatus();
  }, [verificarStatus]);

  return (
    <PremiumContext.Provider value={{ isPremium, email, loading, ativarPremium, verificarStatus, logout }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
