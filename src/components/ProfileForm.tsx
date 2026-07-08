"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialFirstName?: string | null;
  initialLastName?: string | null;
  email: string;
};

const inp: React.CSSProperties = {
  background: "var(--cd)",
  border: "1px solid var(--ce)",
  color: "var(--ct)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 6,
  color: "var(--cm)",
};

export default function ProfileForm({ initialFirstName, initialLastName, email }: ProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName]   = useState(initialLastName ?? "");
  const [saving, setSaving]       = useState(false);
  const [status, setStatus]       = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });

  const isDirty = firstName !== (initialFirstName ?? "") || lastName !== (initialLastName ?? "");

  async function handleSave() {
    setSaving(true);
    setStatus({ type: "idle", message: "" });
    try {
      const res = await fetch("/api/account/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "Profil mis à jour." });
        router.refresh();
      } else {
        setStatus({ type: "error", message: data.message ?? "Erreur lors de la sauvegarde." });
      }
    } catch {
      setStatus({ type: "error", message: "Erreur réseau, réessayez." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setStatus({ type: "idle", message: "" }); }}
            placeholder="Jean"
            style={inp}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--ca)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ce)")}
          />
        </div>
        <div>
          <label style={lbl}>Nom</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setStatus({ type: "idle", message: "" }); }}
            placeholder="Dupont"
            style={inp}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--ca)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ce)")}
          />
        </div>
      </div>

      <div>
        <label style={lbl}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          style={{ ...inp, opacity: 0.45, cursor: "not-allowed" }}
        />
        <p style={{ fontSize: 11, marginTop: 4, color: "var(--cm)" }}>L&apos;email ne peut pas être modifié.</p>
      </div>

      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving || !firstName.trim() || !lastName.trim()}
          style={{
            background: "var(--ck)",
            color: "var(--cat)",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: saving || !firstName.trim() || !lastName.trim() ? "not-allowed" : "pointer",
            opacity: saving || !firstName.trim() || !lastName.trim() ? 0.5 : 1,
            transition: "opacity 0.15s",
            alignSelf: "flex-start",
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      )}

      {status.message && (
        <p style={{ fontSize: 13, fontWeight: 600, color: status.type === "error" ? "#f87171" : "#4ade80" }}>
          {status.type === "success" ? "✓ " : ""}{status.message}
        </p>
      )}
    </div>
  );
}
