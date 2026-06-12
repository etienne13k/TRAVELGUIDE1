CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT UNIQUE,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan TEXT NOT NULL,
  destination TEXT NOT NULL,
  quiz_responses JSONB,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  promo_code TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, promo_code)
);

CREATE TABLE IF NOT EXISTS ip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guide_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guide_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS questionnaire_data JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_cents INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur';
ALTER TABLE orders ALTER COLUMN destination DROP NOT NULL;

ALTER TABLE promo_usage ADD COLUMN IF NOT EXISTS product_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_session_id_unique ON orders(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_logs_ip_action_created_at ON ip_logs(ip_address, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_expires_at ON password_reset_tokens(user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS payment_sessions (
  session_id TEXT PRIMARY KEY,
  email TEXT,
  plan TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration TEXT NOT NULL,
  pdf_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_created_at ON admin_login_attempts(ip_address, created_at DESC);

DROP VIEW IF EXISTS promo_usages;
CREATE VIEW promo_usages AS
SELECT id, user_id, promo_code, product_id, used_at FROM promo_usage;

DROP VIEW IF EXISTS users;
CREATE VIEW users AS
SELECT
  id,
  email,
  password_hash,
  phone AS phone_number,
  phone_verified,
  is_suspended,
  suspended_at,
  created_at
FROM profiles;
