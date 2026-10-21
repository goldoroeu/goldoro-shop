"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Грешка при вход.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Gold'Oro</p>
        <h1>Вход в админ панела</h1>
        <label htmlFor="password">Парола</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="admin-error">{error}</p>}
        <button className="btn btn-gold btn-block" type="submit" disabled={loading}>
          {loading ? "Влизане…" : "Влез"}
        </button>
      </form>
    </main>
  );
}
