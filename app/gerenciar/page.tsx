"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { MetricEntry } from "@/lib/types";

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${names[Number(month) - 1]} de ${year}`;
}

export default function GerenciarPage() {
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics((data.metrics || []).slice().reverse()))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");

    try {
      const res = await fetch("/api/metrics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao apagar.");
      }

      setMetrics((prev) => prev.filter((m) => m.id !== id));
      setConfirmingId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-1">
          Gerenciar métricas
        </h2>
        <p className="text-sm text-muted mb-6">
          Veja todos os meses registrados e apague algum lançamento, por
          exemplo um teste feito por engano.
        </p>

        {error && (
          <p className="text-sm text-clay bg-clay/10 border border-clay/30 rounded-sm px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Carregando...</p>
        ) : metrics.length === 0 ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center">
            <p className="text-sm text-muted">Nenhuma métrica registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.map((m) => (
              <div
                key={m.id}
                className="bg-card border border-line rounded-md p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-ink">
                    {formatMonthLabel(m.month)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {m.followers.toLocaleString("pt-BR")} seguidores ·{" "}
                    {m.reach.toLocaleString("pt-BR")} de alcance ·{" "}
                    {m.posts_count} posts
                  </p>
                </div>

                {confirmingId === m.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-clay">Apagar mesmo?</span>
                    <button
                      onClick={() => handleDelete(m.id!)}
                      disabled={deletingId === m.id}
                      className="text-xs bg-clay hover:bg-clay/90 text-white px-3 py-1.5 rounded-sm transition-colors disabled:opacity-60"
                    >
                      {deletingId === m.id ? "Apagando..." : "Sim, apagar"}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-xs text-muted hover:bg-line px-3 py-1.5 rounded-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(m.id!)}
                    className="text-xs text-clay border border-clay/30 hover:bg-clay/10 px-3 py-1.5 rounded-sm transition-colors"
                  >
                    Apagar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
