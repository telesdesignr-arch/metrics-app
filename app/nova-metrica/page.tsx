"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "followers", label: "Seguidores (total no fim do mês)" },
  { key: "new_followers", label: "Novos seguidores no mês" },
  { key: "reach", label: "Alcance", hint: "Contas alcançadas no mês (Insights)" },
  { key: "impressions", label: "Impressões" },
  { key: "profile_visits", label: "Visitas ao perfil" },
  { key: "likes", label: "Curtidas (total do mês)" },
  { key: "comments", label: "Comentários (total do mês)" },
  { key: "shares", label: "Compartilhamentos (total do mês)" },
  { key: "saves", label: "Salvamentos (total do mês)" },
  { key: "posts_count", label: "Quantidade de posts publicados" },
];

function currentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function NovaMetricaPage() {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonthValue());
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const payload: Record<string, any> = {
      month: `${month}-01`,
      notes,
    };
    for (const field of FIELDS) {
      payload[field.key] = Number(values[field.key] || 0);
    }

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
      setTimeout(() => router.push("/"), 900);
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
          Registrar métricas do mês
        </h2>
        <p className="text-sm text-muted mb-6">
          Preencha com os números do Instagram Insights referentes ao mês selecionado.
          Se já existir um registro para esse mês, ele será atualizado.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-line rounded-lg p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-graphite mb-1.5">
              Mês de referência
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full sm:w-52 border border-line rounded-sm px-3 py-2 text-sm bg-parchment"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-graphite mb-1.5">
                  {field.label}
                </label>
                {field.hint && (
                  <p className="text-xs text-muted mb-1">{field.hint}</p>
                )}
                <input
                  type="number"
                  min="0"
                  value={values[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-parchment"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div>
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
            <p className="text-sm text-moss">Métricas salvas com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-ochre hover:bg-ochreDark text-white text-sm font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar métricas"}
          </button>
        </form>
      </main>
    </div>
  );
}
