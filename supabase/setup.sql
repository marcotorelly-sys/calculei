-- ============================================================
-- CALCULEI — Setup do Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

-- Tabela de usuários Premium
CREATE TABLE IF NOT EXISTS premium_users (
  email TEXT PRIMARY KEY,
  payment_id TEXT,
  mp_status TEXT DEFAULT 'approved',
  amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de intenções de pagamento (opcional, para tracking)
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_premium_users_expires ON premium_users(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_intents_email ON payment_intents(email);

-- Row Level Security (RLS)
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode ler premium_users (para verificar status)
CREATE POLICY "Leitura pública de premium_users"
  ON premium_users FOR SELECT
  USING (true);

-- Política: apenas service_role pode inserir/atualizar (webhook)
CREATE POLICY "Inserção via service_role"
  ON premium_users FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Atualização via service_role"
  ON premium_users FOR UPDATE
  USING (auth.role() = 'service_role');

-- Política: qualquer um pode inserir intenções
CREATE POLICY "Inserção pública de payment_intents"
  ON payment_intents FOR INSERT
  WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON premium_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Para ativar Premium MANUALMENTE (enquanto o webhook não está configurado):
--
-- INSERT INTO premium_users (email, payment_id, expires_at)
-- VALUES ('email@do.cliente', 'manual', NOW() + INTERVAL '30 days')
-- ON CONFLICT (email) DO UPDATE SET expires_at = NOW() + INTERVAL '30 days';
-- ============================================================
