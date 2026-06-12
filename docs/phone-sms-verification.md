# Vérification SMS du téléphone

## Routes livrées

- `POST /api/phone/send-otp`
  - Body : `{ "phone": "+33612345678" }`
  - Auth requise via cookie `tgai_session`.
  - Vérifie l'unicité du numéro sur le compte utilisateur/profil courant.
  - Applique une limite de 3 envois par numéro et par heure via `ip_logs` avec `action = 'phone_otp_send'`.
  - Envoie le SMS via le provider défini par `SMS_PROVIDER`.
  - Stocke le `verification_sid`, le provider et le statut dans `phone_verifications`.

- `POST /api/phone/verify-otp`
  - Body : `{ "phone": "+33612345678", "code": "123456" }`
  - Auth requise via cookie `tgai_session`.
  - Vérifie le code via le provider SMS.
  - Si le code est approuvé, met à jour le compte avec `phone_verified = true` et le numéro validé.

- `GET /api/phone/status`
  - Utilisé par la landing page pour afficher le badge 🎁 en mode `Déjà débloqué` quand l'utilisateur connecté a un téléphone vérifié.

## Variables d'environnement

```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

En local uniquement, `SMS_PROVIDER=mock` et `SMS_MOCK_CODE=123456` permettent de tester l'interface sans envoyer de SMS. Le provider `mock` est désactivé en production.

## Créer le service Twilio Verify

1. Dans Twilio Console, ouvrir **Verify** puis créer un **Verification Service**.
2. Activer le canal **SMS** sur ce service.
3. Copier le **Service SID** du service Verify dans `TWILIO_VERIFY_SERVICE_SID`.
4. Copier l'**Account SID** et l'**Auth Token** Twilio dans `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN`.
5. Définir `SMS_PROVIDER=twilio` dans Vercel et en local si nécessaire.
6. Redéployer l'application après configuration des variables.

## Migration SQL

```sql
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
```
