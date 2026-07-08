import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5";

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;
}

export async function getAnthropicApiKey(): Promise<string | null> {
  const envKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (envKey) return envKey;
  if (!process.env.DATABASE_URL) return null;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query("SELECT value FROM app_config WHERE key = 'ANTHROPIC_API_KEY' LIMIT 1");
    return result.rows[0]?.value?.trim() || null;
  } catch {
    return null;
  } finally {
    await pool.end().catch(() => undefined);
  }
}

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

export function getAnthropicText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
