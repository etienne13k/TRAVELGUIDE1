CREATE INDEX IF NOT EXISTS idx_ip_logs_ip_action_created_at
  ON ip_logs(ip_address, action, created_at DESC);

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
    CREATE UNIQUE INDEX IF NOT EXISTS users_phone_number_unique
      ON users(phone_number)
      WHERE phone_number IS NOT NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND c.relkind IN ('r', 'p')
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
      ON profiles(phone)
      WHERE phone IS NOT NULL;
  END IF;
END $$;
