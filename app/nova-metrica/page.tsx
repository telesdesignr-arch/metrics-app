"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { MetricEntry } from "@/lib/types";

function currentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const CONTENT_TYPES: { key: "reels" | "stories" | "posts"; label: string }[] = [
  { key: "reels", label: "Reels" },
  { key: "stories", label: "Stories" },
  { key: "posts", label: "Posts" },
];

const INTERACTION_FIELDS: { key: string; label: string }[] = [
  { key: "likes", label: "Curtidas" },
  { key: "comments", label: "Comentários" },
  { key: "saves", label: "Salvamentos" },
  { key: "shares", label: "Compartilhamentos" },
  { key: "reposts", label: "Reposts" },
];

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-graphite mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-parchment"
          placeholder="0"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <h3 className="font-display text-sm font-semibold text-ink mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted mb-4">{description}</p>
      )}
      <div className={description ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

function NovaMetricaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMonth = searchParams.get("month"); // formato "YYYY-MM" se estiver editando

  const [month, setMonth] = useState(editMonth || currentMonthValue());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(!!editMonth);

  const [v, setV] = useState<Record<string, string>>({});
  const [contentData, setContentData] = useState<Record<string, Record<string, string>>>({
    reels: {},
    stories: {},
    posts: {},
  });

  // Se veio com ?month=, carrega os dados existentes daquele mês pra edição.
  useEffect(() => {
    if (!editMonth) return;

    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        const list: MetricEntry[] = data.metrics || [];
        const existing = list.find((m) => m.month.slice(0, 7) === editMonth);
        if (!existing) return;

        setV({
          followers: String(existing.followers ?? ""),
          followers_gained: String(existing.followers_gained ?? ""),
          followers_lost: String(existing.followers_lost ?? ""),
          gender_men_pct: String(existing.gender_men_pct ?? ""),
          gender_women_pct: String(existing.gender_women_pct ?? ""),
          views_total: String(existing.views_total ?? ""),
          views_reels_pct: String(existing.views_reels_pct ?? ""),
          views_stories_pct: String(existing.views_stories_pct ?? ""),
          views_posts_pct: String(existing.views_posts_pct ?? ""),
          accounts_reached_pct: String(existing.accounts_reached_pct ?? ""),
          interactions_total: String(existing.interactions_total ?? ""),
          interactions_followers_pct: String(existing.interactions_followers_pct ?? ""),
          interactions_non_followers_pct: String(existing.interactions_non_followers_pct ?? ""),
          interactions_reels_pct: String(existing.interactions_reels_pct ?? ""),
          interactions_stories_pct: String(existing.interactions_stories_pct ?? ""),
          interactions_posts_pct: String(existing.interactions_posts_pct ?? ""),
          profile_visits: String(existing.profile_visits ?? ""),
          posts_count: String(existing.posts_count ?? ""),
        });

        setContentData({
          reels: {
            likes: String(existing.reels?.likes ?? ""),
            comments: String(existing.reels?.comments ?? ""),
            saves: String(existing.reels?.saves ?? ""),
            shares: String(existing.reels?.shares ?? ""),
            reposts: String(existing.reels?.reposts ?? ""),
          },
          stories: {
            likes: String(existing.stories?.likes ?? ""),
            comments: String(existing.stories?.comments ?? ""),
            saves: String(existing.stories?.saves ?? ""),
            shares: String(existing.stories?.shares ?? ""),
            reposts: String(existing.stories?.reposts ?? ""),
          },
          posts: {
            likes: String(existing.posts?.likes ?? ""),
            comments: String(existing.posts?.comments ?? ""),
            saves: String(existing.posts?.saves ?? ""),
            shares: String(existing.posts?.shares ?? ""),
            reposts: String(existing.posts?.reposts ?? ""),
          },
        });

        setNotes(existing.notes || "");
      })
      .finally(() => setLoadingExisting(false));
  }, [editMonth]);

  function setField(key: string, value: string) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function setContentField(type: string, field: string, value: string) {
    setContentData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }

  function num(key: string) {
    return Number(v[key] || 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const buildContent = (type: string) => ({
      likes: Number(contentData[type]?.likes || 0),
      comments: Number(contentData[type]?.comments || 0),
      saves: Number(contentData[type]?.saves || 0),
      shares: Number(contentData[type]?.shares || 0),
      reposts: Number(contentData[type]?.reposts || 0),
    });

    const payload = {
      month: `${month}-01`,
      notes,

      followers: num("followers"),
      followers_gained: num("followers_gained"),
      followers_lost: num("followers_lost"),
      gender_men_pct: num("gender_men_pct"),
      gender_women_pct: num("gender_women_pct"),

      views_total: num("views_total"),
      views_reels_pct: num("views_reels_pct"),
      views_stories_pct: num("views_stories_pct"),
      views_posts_pct: num("views_posts_pct"),
      accounts_reached_pct: num("accounts_reached_pct"),

      interactions_total: num("interactions_total"),
      interactions_followers_pct: num("interactions_followers_pct"),
      interactions_non_followers_pct: num("interactions_non_followers_pct"),
      interactions_reels_pct: num("interactions_reels_pct"),
      interactions_stories_pct: num("interactions_stories_pct"),
      interactions_posts_pct: num("interactions_posts_pct"),

      reels: buildContent("reels"),
      stories: buildContent("stories"),
      posts: buildContent("posts"),

      profile_visits: num("profile_visits"),
      posts_count: num("posts_count"),
    };

    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar.");
      }

      setSuccess(true);
      setTimeout(() => router.push(editMonth ? "/gerenciar" : "/"), 900);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-1">
          {editMonth ? "Editar métricas do mês" : "Registrar métricas do mês"}
        </h2>
        <p className="text-sm text-muted mb-6">
          {editMonth
            ? "Ajuste os números abaixo e salve para atualizar este mês."
            : "Preencha com os números do Instagram Insights (últimos 30 dias) do Painel Profissional. Se já existir um registro para esse mês, ele será atualizado."}
        </p>

        {loadingExisting && (
          <p className="text-sm text-muted mb-4">Carregando dados existentes...</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-card border border-line rounded-lg p-5">
            <label className="block text-sm font-medium text-graphite mb-1.5">
              Mês de referência
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              disabled={!!editMonth}
              className="w-full sm:w-52 border border-line rounded-sm px-3 py-2 text-sm bg-parchment disabled:opacity-60"
            />
            {editMonth && (
              <p className="text-xs text-muted mt-1.5">
                Não é possível trocar o mês ao editar. Para mudar de mês, apague
                e crie um novo registro.
              </p>
            )}
          </div>

          {/* Visualizações */}
          <Section
            title="Visualizações"
            description="Aba 'Visualizações' do Insights"
          >
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Visualizações totais" value={v.views_total || ""} onChange={(x) => setField("views_total", x)} />
              <NumberField label="Contas alcançadas" value={v.accounts_reached_pct || ""} onChange={(x) => setField("accounts_reached_pct", x)} suffix="%" />
              <NumberField label="% em Reels" value={v.views_reels_pct || ""} onChange={(x) => setField("views_reels_pct", x)} suffix="%" />
              <NumberField label="% em Stories" value={v.views_stories_pct || ""} onChange={(x) => setField("views_stories_pct", x)} suffix="%" />
              <NumberField label="% em Posts" value={v.views_posts_pct || ""} onChange={(x) => setField("views_posts_pct", x)} suffix="%" />
            </div>
          </Section>

          {/* Interações - visão geral */}
          <Section
            title="Interações — visão geral"
            description="Aba 'Interações' do Insights"
          >
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Interações totais" value={v.interactions_total || ""} onChange={(x) => setField("interactions_total", x)} />
              <div />
              <NumberField label="% de seguidores" value={v.interactions_followers_pct || ""} onChange={(x) => setField("interactions_followers_pct", x)} suffix="%" />
              <NumberField label="% de não seguidores" value={v.interactions_non_followers_pct || ""} onChange={(x) => setField("interactions_non_followers_pct", x)} suffix="%" />
              <NumberField label="% em Reels" value={v.interactions_reels_pct || ""} onChange={(x) => setField("interactions_reels_pct", x)} suffix="%" />
              <NumberField label="% em Stories" value={v.interactions_stories_pct || ""} onChange={(x) => setField("interactions_stories_pct", x)} suffix="%" />
              <NumberField label="% em Posts" value={v.interactions_posts_pct || ""} onChange={(x) => setField("interactions_posts_pct", x)} suffix="%" />
            </div>
          </Section>

          {/* Interações detalhadas por tipo de conteúdo */}
          <Section
            title="Interações detalhadas"
            description="Quantidade de cada interação, separado por Reels, Stories e Posts"
          >
            <div className="space-y-5">
              {CONTENT_TYPES.map((ct) => (
                <div key={ct.key}>
                  <p className="text-xs font-semibold text-ochreDark mb-2">{ct.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INTERACTION_FIELDS.map((f) => (
                      <NumberField
                        key={f.key}
                        label={f.label}
                        value={contentData[ct.key]?.[f.key] || ""}
                        onChange={(x) => setContentField(ct.key, f.key, x)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Seguidores */}
          <Section
            title="Seguidores"
            description="Aba 'Seguidores' do Insights"
          >
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Seguidores (total atual)" value={v.followers || ""} onChange={(x) => setField("followers", x)} />
              <div />
              <NumberField label="Ganhos no mês" value={v.followers_gained || ""} onChange={(x) => setField("followers_gained", x)} />
              <NumberField label="Deixaram de seguir" value={v.followers_lost || ""} onChange={(x) => setField("followers_lost", x)} />
              <NumberField label="% Homens" value={v.gender_men_pct || ""} onChange={(x) => setField("gender_men_pct", x)} suffix="%" />
              <NumberField label="% Mulheres" value={v.gender_women_pct || ""} onChange={(x) => setField("gender_women_pct", x)} suffix="%" />
            </div>
          </Section>

          {/* Outros */}
          <Section title="Outros">
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Visitas ao perfil" value={v.profile_visits || ""} onChange={(x) => setField("profile_visits", x)} />
              <NumberField label="Posts publicados no mês" value={v.posts_count || ""} onChange={(x) => setField("posts_count", x)} />
            </div>
          </Section>

          <div className="bg-card border border-line rounded-lg p-5">
            <label className="block text-sm font-medium text-graphite mb-1.5">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-parchment"
              placeholder="Ex.: mês da Conferência Edificar, campanha específica, etc."
            />
          </div>

          {error && <p className="text-sm text-clay">{error}</p>}
          {success && (
            <p className="text-sm text-moss">
              {editMonth ? "Métricas atualizadas com sucesso!" : "Métricas salvas com sucesso!"}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-ochre hover:bg-ochreDark text-white text-sm font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando..." : editMonth ? "Salvar alterações" : "Salvar métricas"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function NovaMetricaPage() {
  return (
    <Suspense fallback={null}>
      <NovaMetricaForm />
    </Suspense>
  );
}
