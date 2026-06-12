DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'users'
      AND c.relkind IN ('r', 'p')
  ) THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

    CREATE TABLE IF NOT EXISTS promo_usages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      promo_code TEXT NOT NULL,
      product_id TEXT,
      used_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, promo_code)
    );
  ELSIF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND c.relkind IN ('r', 'p')
  ) THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

    CREATE TABLE IF NOT EXISTS promo_usage (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      promo_code TEXT NOT NULL,
      used_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, promo_code)
    );
  END IF;
END $$;
