"use client";

import { useEffect, useMemo, useState } from "react";
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
import { buildMonthlySummary } from "@/lib/reportSummary";

function formatMonthShort(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${names[Number(month) - 1]}/${year.slice(2)}`;
}

function formatMonthFull(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${names[Number(month) - 1]} de ${year}`;
}

export default function RelatorioPage() {
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        const list: MetricEntry[] = data.metrics || [];
        setMetrics(list);
        if (list.length > 0) {
          setSelectedMonth(list[list.length - 1].month);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentIndex = metrics.findIndex((m) => m.month === selectedMonth);
  const current = currentIndex >= 0 ? metrics[currentIndex] : undefined;
  const previous = currentIndex > 0 ? metrics[currentIndex - 1] : undefined;

  const historyUpToSelected = useMemo(
    () => metrics.slice(0, currentIndex + 1),
    [metrics, currentIndex]
  );

  const chartData = historyUpToSelected.map((m) => ({
    mes: formatMonthShort(m.month),
    Seguidores: m.followers,
    Alcance: m.reach,
    Engajamento: m.likes + m.comments + m.shares + m.saves,
  }));

  const summaryLines = current ? buildMonthlySummary(current, previous) : [];

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <NavBar />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 print:max-w-none print:px-0 print:py-0">
        {/* Controles - somem na impressão */}
        <div className="print:hidden flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-1">
              Relatório mensal
            </h2>
            <p className="text-sm text-muted">
              Escolha o mês de referência e clique em baixar para gerar o PDF.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {metrics.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-line rounded-sm px-3 py-2 text-sm bg-card"
              >
                {metrics.map((m) => (
                  <option key={m.month} value={m.month}>
                    {formatMonthFull(m.month)}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handlePrint}
              disabled={!current}
              className="bg-ochre hover:bg-ochreDark text-white text-sm font-medium px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
            >
              Baixar PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted print:hidden">Carregando...</p>
        ) : !current ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center print:hidden">
            <p className="text-sm text-muted">
              Nenhuma métrica registrada ainda. Cadastre um mês em "+ Nova métrica" primeiro.
            </p>
          </div>
        ) : (
          /* -------- Conteúdo do relatório (isso é o que vai pro PDF) -------- */
          <div className="bg-white print:shadow-none rounded-lg border border-line print:border-0 p-8 print:p-0">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-line pb-5 mb-6 print:pb-4 print:mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-1">
                  Igreja Batista Atitude Méier
                </p>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  Relatório de Instagram
                </h1>
                <p className="text-sm text-ochreDark font-medium mt-0.5">
                  {formatMonthFull(current.month)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center text-white font-display font-semibold text-lg">
                AM
              </div>
            </div>

            {/* KPIs principais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7 print:grid-cols-4">
              {[
                { label: "Seguidores", value: current.followers },
                { label: "Novos seguidores", value: current.new_followers },
                { label: "Alcance", value: current.reach },
                {
                  label: "Engajamento total",
                  value: current.likes + current.comments + current.shares + current.saves,
                },
              ].map((kpi) => (
                <div key={kpi.label} className="border border-line rounded-md p-3">
                  <p className="text-[11px] text-muted mb-1">{kpi.label}</p>
                  <p className="font-display text-lg font-semibold text-ink">
                    {kpi.value.toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>

            {/* Resumo em linguagem simples */}
            <div className="mb-7">
              <h2 className="font-display text-sm font-semibold text-ink mb-3">
                O que aconteceu este mês
              </h2>
              <ul className="space-y-1.5">
                {summaryLines.map((line, i) => (
                  <li key={i} className="text-sm text-graphite leading-relaxed flex gap-2">
                    <span className="text-ochreDark">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {!previous && (
                <p className="text-xs text-muted mt-2">
                  * Este é o primeiro mês com dados — a partir do próximo mês, o
                  relatório vai comparar a evolução.
                </p>
              )}
            </div>

            {/* Gráfico de evolução */}
            {chartData.length > 1 && (
              <div className="mb-7 print:break-inside-avoid">
                <h2 className="font-display text-sm font-semibold text-ink mb-3">
                  Evolução de seguidores e alcance
                </h2>
                <div className="border border-line rounded-md p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD3" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8B8578" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#8B8578" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Seguidores" stroke="#C98A2C" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Alcance" stroke="#5C7A5C" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de engajamento */}
            {chartData.length > 1 && (
              <div className="mb-7 print:break-inside-avoid">
                <h2 className="font-display text-sm font-semibold text-ink mb-3">
                  Engajamento por mês
                </h2>
                <div className="border border-line rounded-md p-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD3" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8B8578" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#8B8578" }} />
                      <Tooltip />
                      <Bar dataKey="Engajamento" fill="#B4573F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Glossário simples */}
            <div className="mb-2 print:break-inside-avoid">
              <h2 className="font-display text-sm font-semibold text-ink mb-3">
                O que significa cada número
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 text-xs text-graphite leading-relaxed">
                <p><b className="text-ink">Seguidores:</b> pessoas que seguem o perfil da igreja.</p>
                <p><b className="text-ink">Alcance:</b> quantidade de contas diferentes que viram algum post.</p>
                <p><b className="text-ink">Engajamento:</b> soma de curtidas, comentários, compartilhamentos e salvamentos.</p>
                <p><b className="text-ink">Visitas ao perfil:</b> quantas vezes alguém entrou no perfil da igreja.</p>
              </div>
            </div>

            <div className="border-t border-line pt-4 mt-6 text-center">
              <p className="text-[11px] text-muted">
                Relatório gerado automaticamente — Design & Gestão de Redes Sociais, Atitude Méier
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
