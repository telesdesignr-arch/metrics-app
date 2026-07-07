"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Não foi possível entrar.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">
            Atitude Méier · Comunicação
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Painel de Métricas
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-line rounded-lg p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-graphite mb-2">
            Senha de acesso
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-4 bg-parchment"
            placeholder="Digite a senha"
            autoFocus
          />

          {error && (
            <p className="text-sm text-clay mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ochre hover:bg-ochreDark text-white text-sm font-medium py-2.5 rounded-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
