"use client";

import { useState } from "react";

export default function PhoneForm({ initialPhone }: { initialPhone?: string | null }) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/account/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message ?? "Erreur lors de la sauvegarde.");
      }
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setSuccess(false); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="+33 6 12 34 56 78"
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2"
          style={{ borderColor: "#E8E0D0", background: "#FDFAF5" }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !phone.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#425C47" }}
        >
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>
      {success && (
        <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
          ✓ Numéro enregistré.
        </p>
      )}
      {error && <p className="text-sm" style={{ color: "#dc2626" }}>{error}</p>}
      <p className="text-xs" style={{ color: "#9a8f80" }}>
        Format international requis · Ex : +33 6 12 34 56 78
      </p>
    </div>
  );
}
