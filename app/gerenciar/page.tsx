"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { MetricEntry, AnalysisEntry } from "@/lib/types";

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${names[Number(month) - 1]} de ${year}`;
}

export default function GerenciarPage() {
  const [tab, setTab] = useState<"metricas" | "analises">("metricas");

  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [deletingMetricId, setDeletingMetricId] = useState<string | null>(null);
  const [confirmingMetricId, setConfirmingMetricId] = useState<string | null>(null);
  const [metricError, setMetricError] = useState("");

  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);
  const [confirmingAnalysisId, setConfirmingAnalysisId] = useState<string | null>(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  function loadMetrics() {
    setLoadingMetrics(true);
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics((data.metrics || []).slice().reverse()))
      .finally(() => setLoadingMetrics(false));
  }

  function loadAnalyses() {
    setLoadingAnalyses(true);
    fetch("/api/analyses")
      .then((res) => res.json())
      .then((data) => setAnalyses((data.analyses || []).slice().reverse()))
      .finally(() => setLoadingAnalyses(false));
  }

  useEffect(() => {
    loadMetrics();
    loadAnalyses();
  }, []);

  async function handleDeleteMetric(id: string) {
    setDeletingMetricId(id);
    setMetricError("");

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
      setConfirmingMetricId(null);
    } catch (err: any) {
      setMetricError(err.message);
    } finally {
      setDeletingMetricId(null);
    }
  }

  async function handleDeleteAnalysis(id: string) {
    setDeletingAnalysisId(id);
    setAnalysisError("");

    try {
      const res = await fetch("/api/analyses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao apagar.");
      }

      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setConfirmingAnalysisId(null);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setDeletingAnalysisId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-1">
          Gerenciar
        </h2>
        <p className="text-sm text-muted mb-6">
          Veja e apague registros de métricas ou de análises salvas por engano.
        </p>

        {/* Abas */}
        <div className="flex gap-1 mb-6 border-b border-line">
          <button
            onClick={() => setTab("metricas")}
            className={`text-sm px-4 py-2 border-b-2 transition-colors ${
              tab === "metricas"
                ? "border-ochre text-ink font-medium"
                : "border-transparent text-muted hover:text-graphite"
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setTab("analises")}
            className={`text-sm px-4 py-2 border-b-2 transition-colors ${
              tab === "analises"
                ? "border-ochre text-ink font-medium"
                : "border-transparent text-muted hover:text-graphite"
            }`}
          >
            Análises salvas
          </button>
        </div>

        {/* Aba: Métricas */}
        {tab === "metricas" && (
          <>
            {metricError && (
              <p className="text-sm text-clay bg-clay/10 border border-clay/30 rounded-sm px-3 py-2 mb-4">
                {metricError}
              </p>
            )}

            {loadingMetrics ? (
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

                    {confirmingMetricId === m.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-clay">Apagar mesmo?</span>
                        <button
                          onClick={() => handleDeleteMetric(m.id!)}
                          disabled={deletingMetricId === m.id}
                          className="text-xs bg-clay hover:bg-clay/90 text-white px-3 py-1.5 rounded-sm transition-colors disabled:opacity-60"
                        >
                          {deletingMetricId === m.id ? "Apagando..." : "Sim, apagar"}
                        </button>
                        <button
                          onClick={() => setConfirmingMetricId(null)}
                          className="text-xs text-muted hover:bg-line px-3 py-1.5 rounded-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingMetricId(m.id!)}
                        className="text-xs text-clay border border-clay/30 hover:bg-clay/10 px-3 py-1.5 rounded-sm transition-colors"
                      >
                        Apagar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Aba: Análises salvas */}
        {tab === "analises" && (
          <>
            <p className="text-xs text-muted mb-4">
              Estas são as análises geradas pela IA no Dashboard. Elas ficam
              salvas para permitir a comparação entre meses.
            </p>

            {analysisError && (
              <p className="text-sm text-clay bg-clay/10 border border-clay/30 rounded-sm px-3 py-2 mb-4">
                {analysisError}
              </p>
            )}

            {loadingAnalyses ? (
              <p className="text-sm text-muted">Carregando...</p>
            ) : analyses.length === 0 ? (
              <div className="bg-card border border-line rounded-lg p-8 text-center">
                <p className="text-sm text-muted">
                  Nenhuma análise salva ainda. Gere uma no Dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((a) => (
                  <div
                    key={a.id}
                    className="bg-card border border-line rounded-md p-4"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-display text-sm font-semibold text-ink">
                          {formatMonthLabel(a.month)}
                        </p>
                        <button
                          onClick={() =>
                            setExpandedAnalysisId(
                              expandedAnalysisId === a.id ? null : a.id!
                            )
                          }
                          className="text-xs text-ochreDark hover:underline mt-0.5"
                        >
                          {expandedAnalysisId === a.id ? "Ocultar texto" : "Ver texto completo"}
                        </button>
                      </div>

                      {confirmingAnalysisId === a.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-clay">Apagar mesmo?</span>
                          <button
                            onClick={() => handleDeleteAnalysis(a.id!)}
                            disabled={deletingAnalysisId === a.id}
                            className="text-xs bg-clay hover:bg-clay/90 text-white px-3 py-1.5 rounded-sm transition-colors disabled:opacity-60"
                          >
                            {deletingAnalysisId === a.id ? "Apagando..." : "Sim, apagar"}
                          </button>
                          <button
                            onClick={() => setConfirmingAnalysisId(null)}
                            className="text-xs text-muted hover:bg-line px-3 py-1.5 rounded-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingAnalysisId(a.id!)}
                          className="text-xs text-clay border border-clay/30 hover:bg-clay/10 px-3 py-1.5 rounded-sm transition-colors"
                        >
                          Apagar
                        </button>
                      )}
                    </div>

                    {expandedAnalysisId === a.id && (
                      <div className="mt-3 pt-3 border-t border-line text-sm text-graphite whitespace-pre-wrap leading-relaxed">
                        {a.analysis}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
