"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import NavBar from "@/components/NavBar";
import { MetricEntry } from "@/lib/types";

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const names = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${names[Number(month) - 1]}/${year.slice(2)}`;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data.metrics || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalysis("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao gerar análise.");
      setAnalysis(data.analysis);
    } catch (err: any) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  const chartData = metrics.map((m) => ({
    mes: formatMonth(m.month.slice(0, 7)),
    Seguidores: m.followers,
    Alcance: m.reach,
    Impressões: m.impressions,
    Engajamento: m.likes + m.comments + m.shares + m.saves,
  }));

  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];

  function delta(key: keyof MetricEntry) {
    if (!latest || !previous) return null;
    const diff = Number(latest[key]) - Number(previous[key]);
    return diff;
  }

  const kpis = latest
    ? [
        { label: "Seguidores", value: latest.followers, delta: delta("followers") },
        { label: "Alcance", value: latest.reach, delta: delta("reach") },
        { label: "Impressões", value: latest.impressions, delta: delta("impressions") },
        {
          label: "Engajamento total",
          value: latest.likes + latest.comments + latest.shares + latest.saves,
          delta: null,
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <p className="text-sm text-muted">Carregando dados...</p>
        ) : metrics.length === 0 ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center">
            <p className="font-display text-lg text-ink mb-2">
              Nenhuma métrica registrada ainda
            </p>
            <p className="text-sm text-muted">
              Comece adicionando os números do mês em{" "}
              <span className="font-medium text-ochreDark">+ Nova métrica</span>.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs do último mês */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-card border border-line rounded-md p-4"
                >
                  <p className="text-xs text-muted mb-1">{kpi.label}</p>
                  <p className="font-display text-xl font-semibold text-ink">
                    {kpi.value.toLocaleString("pt-BR")}
                  </p>
                  {kpi.delta !== null && (
                    <p
                      className={`text-xs mt-0.5 ${
                        kpi.delta >= 0 ? "text-moss" : "text-clay"
                      }`}
                    >
                      {kpi.delta >= 0 ? "+" : ""}
                      {kpi.delta.toLocaleString("pt-BR")} vs. mês anterior
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Gráfico de seguidores e alcance */}
            <div className="bg-card border border-line rounded-lg p-5 mb-6">
              <h3 className="font-display text-sm font-semibold text-ink mb-4">
                Evolução de seguidores e alcance
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8B8578" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#8B8578" }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #E4DFD3",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Seguidores"
                    stroke="#C98A2C"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Alcance"
                    stroke="#5C7A5C"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de engajamento */}
            <div className="bg-card border border-line rounded-lg p-5 mb-8">
              <h3 className="font-display text-sm font-semibold text-ink mb-4">
                Engajamento total por mês
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8B8578" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#8B8578" }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #E4DFD3",
                    }}
                  />
                  <Bar dataKey="Engajamento" fill="#B4573F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Análise por IA */}
            <div className="bg-ink rounded-lg p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    Análise inteligente
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Envia o histórico de métricas para uma IA e recebe recomendações
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-ochre hover:bg-ochreDark text-white text-sm font-medium px-4 py-2 rounded-sm transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {analyzing ? "Analisando..." : "Gerar análise com IA"}
                </button>
              </div>

              {analyzeError && (
                <p className="text-sm text-red-300 mt-3">{analyzeError}</p>
              )}

              {analysis && (
                <div className="mt-4 bg-white/5 rounded-md p-4 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
