import type { Pool, PoolClient } from "pg";

type DbClient = Pool | PoolClient;

type AccountTable = {
  table: "users" | "profiles";
  phoneColumn: "phone_number" | "phone";
};

const ACCOUNT_TABLES: AccountTable[] = [
  { table: "users", phoneColumn: "phone_number" },
  { table: "profiles", phoneColumn: "phone" },
];

export type PhoneStatus = {
  phone: string | null;
  phoneVerified: boolean;
};

export const phoneVerificationMessages = {
  not_logged_in: "Connectez-vous pour vérifier votre numéro de téléphone.",
  invalid_phone: "Format téléphone invalide (ex: +33612345678).",
  phone_taken: "Ce numéro de téléphone est déjà associé à un autre compte.",
  rate_limited: "Trop de codes envoyés. Réessayez dans une heure.",
  sms_not_configured: "Service SMS non configuré. Ajoutez les variables Twilio Verify.",
  invalid_code: "Code invalide. Entrez les 6 chiffres reçus par SMS.",
  code_rejected: "Code incorrect ou expiré. Demandez un nouveau code si besoin.",
  server_error: "Erreur serveur, réessayez.",
};

export async function resolveAccountTable(client: DbClient): Promise<AccountTable> {
  const { rows } = await client.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND (
         (table_name = 'users' AND column_name IN ('id', 'phone_number', 'phone_verified')) OR
         (table_name = 'profiles' AND column_name IN ('id', 'phone', 'phone_verified'))
       )`
  );

  for (const candidate of ACCOUNT_TABLES) {
    const columns = rows
      .filter((row) => row.table_name === candidate.table)
      .map((row) => row.column_name);

    if (columns.includes("id") && columns.includes(candidate.phoneColumn) && columns.includes("phone_verified")) {
      return candidate;
    }
  }

  throw new Error("No supported account table found for phone verification.");
}

export async function isPhoneUsedByAnotherAccount(
  client: DbClient,
  phone: string,
  userId: string
): Promise<boolean> {
  const accountTable = await resolveAccountTable(client);
  const { rows } = await client.query<{ id: string }>(
    `SELECT id FROM ${accountTable.table} WHERE ${accountTable.phoneColumn} = $1 AND id <> $2 LIMIT 1`,
    [phone, userId]
  );

  return rows.length > 0;
}

export async function getPhoneStatus(client: DbClient, userId: string): Promise<PhoneStatus> {
  const accountTable = await resolveAccountTable(client);
  const { rows } = await client.query<{ phone: string | null; phone_verified: boolean | null }>(
    `SELECT ${accountTable.phoneColumn} AS phone, phone_verified FROM ${accountTable.table} WHERE id = $1 LIMIT 1`,
    [userId]
  );

  return {
    phone: rows[0]?.phone ?? null,
    phoneVerified: rows[0]?.phone_verified === true,
  };
}

export async function markPhoneVerified(client: DbClient, userId: string, phone: string): Promise<void> {
  const accountTable = await resolveAccountTable(client);
  await client.query(
    `UPDATE ${accountTable.table} SET ${accountTable.phoneColumn} = $1, phone_verified = true WHERE id = $2`,
    [phone, userId]
  );
}

export async function hasReachedPhoneOtpLimit(client: DbClient, phone: string): Promise<boolean> {
  const { rows } = await client.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM ip_logs
     WHERE ip_address = $1
       AND action = 'phone_otp_send'
       AND created_at >= NOW() - INTERVAL '1 hour'`,
    [`phone:${phone}`]
  );

  return Number(rows[0]?.count ?? 0) >= 3;
}

export async function recordPhoneOtpSend(client: DbClient, phone: string): Promise<void> {
  await client.query("INSERT INTO ip_logs (ip_address, action) VALUES ($1, $2)", [`phone:${phone}`, "phone_otp_send"]);
}

export async function storePhoneVerification(params: {
  client: DbClient;
  userId: string;
  phone: string;
  provider: string;
  verificationSid: string | null;
  status: string;
}): Promise<void> {
  await params.client.query(
    `INSERT INTO phone_verifications (user_id, phone, provider, verification_sid, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [params.userId, params.phone, params.provider, params.verificationSid, params.status]
  );
}

export async function updateLatestPhoneVerification(params: {
  client: DbClient;
  userId: string;
  phone: string;
  status: string;
}): Promise<void> {
  await params.client.query(
    `UPDATE phone_verifications
     SET status = $1, updated_at = NOW()
     WHERE id = (
       SELECT id
       FROM phone_verifications
       WHERE user_id = $2 AND phone = $3
       ORDER BY created_at DESC
       LIMIT 1
     )`,
    [params.status, params.userId, params.phone]
  );
}
