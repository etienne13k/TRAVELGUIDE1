"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialFirstName?: string | null;
  initialLastName?: string | null;
  email: string;
};

export default function ProfileForm({ initialFirstName, initialLastName, email }: ProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#425C47" }}>
            Prénom
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setStatus({ type: "idle", message: "" }); }}
            placeholder="Jean"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
            style={{ borderColor: "#E8E0D0", background: "#FDFAF5" }}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#425C47" }}>
            Nom
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setStatus({ type: "idle", message: "" }); }}
            placeholder="Dupont"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
            style={{ borderColor: "#E8E0D0", background: "#FDFAF5" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#425C47" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-xl border px-4 py-2.5 text-sm cursor-not-allowed"
          style={{ borderColor: "#E8E0D0", background: "#f5f3ee", color: "#9a8f80" }}
        />
        <p className="text-xs mt-1" style={{ color: "#9a8f80" }}>L&apos;email ne peut pas être modifié.</p>
      </div>

      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving || !firstName.trim() || !lastName.trim()}
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#425C47" }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      )}

      {status.message && (
        <p className={`text-sm font-medium ${status.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
          {status.type === "success" ? "✓ " : ""}{status.message}
        </p>
      )}
    </div>
  );
}
