import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase — substituir após criar o projeto
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Verificar status premium pelo email
// Retorna: true (premium), false (não premium), null (sem Supabase/offline)
export async function verificarPremium(email: string): Promise<boolean | null> {
  if (!supabase) {
    console.warn('[Calculei] Supabase não configurado — modo offline');
    return null; // null = sem backend, não sobrescrever cache
  }

  try {
    const { data, error } = await supabase
      .from('premium_users')
      .select('email, expires_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) return false;

    // Checar se não expirou
    if (data.expires_at) {
      return new Date(data.expires_at) > new Date();
    }

    return true; // Sem expiração = lifetime
  } catch {
    return false;
  }
}

// Registrar intenção de pagamento (salva email antes de redirecionar)
export async function registrarIntencao(email: string): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('payment_intents')
      .insert({
        email: email.toLowerCase().trim(),
        created_at: new Date().toISOString(),
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Calculei] Erro ao registrar intenção:', error);
      return null;
    }

    return data?.id || null;
  } catch {
    return null;
  }
}
