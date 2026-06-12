DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND c.relkind IN ('r', 'p')
  ) THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
      ON profiles(phone)
      WHERE phone IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'users'
      AND c.relkind IN ('r', 'p')
  ) THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
    CREATE UNIQUE INDEX IF NOT EXISTS users_phone_number_unique
      ON users(phone_number)
      WHERE phone_number IS NOT NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone VARCHAR(20) NOT NULL,
  provider TEXT NOT NULL DEFAULT 'twilio',
  verification_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_created_at
  ON phone_verifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_created_at
  ON phone_verifications(phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ip_logs_phone_otp_limit
  ON ip_logs(ip_address, action, created_at DESC)
  WHERE action = 'phone_otp_send';
