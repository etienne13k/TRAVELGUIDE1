"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button
      onClick={handleLogout}
      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
      style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
    >
      Déconnexion
    </button>
  );
}
