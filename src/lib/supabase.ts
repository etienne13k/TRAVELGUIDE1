import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  email: string;
  password_hash: string;
  phone: string | null;
  phone_verified: boolean | null;
  is_suspended: boolean | null;
  suspended_at: string | null;
  created_at: string | null;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  plan: string;
  destination: string | null;
  quiz_responses: Json | null;
  stripe_session_id: string | null;
  session_id: string | null;
  status: string | null;
  pdf_url: string | null;
  estimated_delivery: string | null;
  guide_url: string | null;
  guide_id: string | null;
  delivered_at: string | null;
  delivery_error: string | null;
  questionnaire_data: Json | null;
  amount_cents: number | null;
  currency: string | null;
  created_at: string | null;
};

type PromoUsageRow = {
  id: string;
  user_id: string | null;
  promo_code: string;
  product_id: string | null;
  used_at: string | null;
};

type PaymentSessionRow = {
  session_id: string;
  email: string | null;
  plan: string | null;
  amount_cents: number | null;
  currency: string | null;
  created_at: string | null;
};

type GuideRow = {
  id: string;
  email: string;
  destination: string;
  duration: string;
  pdf_data: string;
  created_at: string | null;
};

type AdminLogRow = {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Json | null;
  ip_address: string | null;
  created_at: string | null;
};

type AdminLoginAttemptRow = {
  id: string;
  ip_address: string;
  email: string | null;
  success: boolean;
  created_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<ProfileRow, Omit<Partial<ProfileRow>, "email" | "password_hash"> & Pick<ProfileRow, "email" | "password_hash">>;
      orders: TableDefinition<OrderRow, Omit<Partial<OrderRow>, "plan"> & Pick<OrderRow, "plan">>;
      promo_usage: TableDefinition<PromoUsageRow, Omit<Partial<PromoUsageRow>, "promo_code"> & Pick<PromoUsageRow, "promo_code">>;
      ip_logs: TableDefinition<
        { id: string; ip_address: string; action: string; created_at: string | null },
        { id?: string; ip_address: string; action: string; created_at?: string | null }
      >;
      password_reset_tokens: TableDefinition<
        { id: string; user_id: string | null; token_hash: string; expires_at: string; used: boolean | null; created_at: string | null },
        { id?: string; user_id?: string | null; token_hash: string; expires_at: string; used?: boolean | null; created_at?: string | null }
      >;
      payment_sessions: TableDefinition<PaymentSessionRow, Omit<Partial<PaymentSessionRow>, "session_id"> & Pick<PaymentSessionRow, "session_id">>;
      guides: TableDefinition<GuideRow, Omit<Partial<GuideRow>, "email" | "destination" | "duration" | "pdf_data"> & Pick<GuideRow, "email" | "destination" | "duration" | "pdf_data">>;
      admin_logs: TableDefinition<AdminLogRow, Omit<Partial<AdminLogRow>, "admin_email" | "action" | "target_type"> & Pick<AdminLogRow, "admin_email" | "action" | "target_type">>;
      admin_login_attempts: TableDefinition<AdminLoginAttemptRow, Omit<Partial<AdminLoginAttemptRow>, "ip_address"> & Pick<AdminLoginAttemptRow, "ip_address">>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let anonClient: SupabaseClient<Database> | null = null;
let serviceRoleClient: SupabaseClient<Database> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClient(key: string): SupabaseClient<Database> {
  return createClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseAnonClient(): SupabaseClient<Database> {
  anonClient ??= createSupabaseClient(requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  return anonClient;
}

export function createSupabaseServiceRoleClient(): SupabaseClient<Database> {
  serviceRoleClient ??= createSupabaseClient(requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
  return serviceRoleClient;
}
