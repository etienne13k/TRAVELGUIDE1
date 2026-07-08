# Vérification SMS du téléphone

## Routes livrées

- `POST /api/phone/send-otp`
  - Body : `{ "phone": "+33612345678" }`
  - Auth requise via cookie `tgai_session`.
  - Vérifie l'unicité du numéro sur le compte utilisateur/profil courant.
  - Applique une limite de 3 envois par numéro et par heure via `ip_logs` avec `action = 'phone_otp_send'`.
  - Envoie le SMS via le provider défini par `SMS_PROVIDER`.
  - Répond avec `demoMode: true` et `demoCode` si Twilio n'est pas configuré, afin que le frontend affiche clairement le code mock.
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
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMS_MOCK_CODE=000000
```

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_VERIFY_SERVICE_SID` sont obligatoires pour envoyer de vrais SMS. Si `SMS_PROVIDER=twilio` mais qu'une de ces variables est absente (ou laissée à une valeur placeholder), le système passe en mode démo transparent : aucun SMS réel n'est envoyé, l'API renvoie `demoMode: true`, et le frontend affiche `Mode démo - Code : 000000` (ou la valeur de `SMS_MOCK_CODE`).

Pour forcer le mode démo en local, définir `SMS_PROVIDER=mock` et éventuellement `SMS_MOCK_CODE=123456`.

## Créer le service Twilio Verify

1. Dans Twilio Console, ouvrir **Verify** puis créer un **Verification Service**.
2. Activer le canal **SMS** sur ce service.
3. Copier le **Service SID** du service Verify dans `TWILIO_VERIFY_SERVICE_SID`.
4. Copier l'**Account SID** et l'**Auth Token** Twilio dans `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN`.
5. Définir les variables sur Vercel/NanoCorp :
   ```bash
   nanocorp site env set --vars '[{"key":"SMS_PROVIDER","value":"twilio"},{"key":"TWILIO_ACCOUNT_SID","value":"AC..."},{"key":"TWILIO_AUTH_TOKEN","value":"..."},{"key":"TWILIO_VERIFY_SERVICE_SID","value":"VA..."}]'
   ```
6. Redéployer l'application après configuration des variables (un push sur `main` suffit).
7. Vérifier `/api/health` : les trois variables Twilio doivent apparaître comme définies.

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
