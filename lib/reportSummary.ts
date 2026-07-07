import { MetricEntry } from "./types";

function pct(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function describeChange(label: string, current: number, previous: number | undefined, isPercent = false): string {
  const unit = isPercent ? "%" : "";
  if (previous === undefined) {
    return `${label}: ${current.toLocaleString("pt-BR")}${unit} (primeiro mês registrado, ainda sem comparação).`;
  }
  const diff = current - previous;
  const p = pct(current, previous);
  const direction = diff > 0 ? "subiu" : diff < 0 ? "caiu" : "ficou estável";
  const pctText = p !== null && !isPercent ? ` (${diff > 0 ? "+" : ""}${p.toFixed(0)}%)` : "";
  return `${label} ${direction} para ${current.toLocaleString("pt-BR")}${unit}${pctText} em relação ao mês anterior.`;
}

function engagementOf(m: MetricEntry) {
  const sum = (c: { likes: number; comments: number; saves: number; shares: number; reposts: number }) =>
    c.likes + c.comments + c.saves + c.shares + c.reposts;
  return sum(m.reels) + sum(m.stories) + sum(m.posts);
}

export function buildMonthlySummary(
  current: MetricEntry,
  previous: MetricEntry | undefined
): string[] {
  return [
    describeChange("O número de seguidores", current.followers, previous?.followers),
    describeChange("As visualizações totais", current.views_total, previous?.views_total),
    describeChange("As contas alcançadas", current.accounts_reached_pct, previous?.accounts_reached_pct, true),
    describeChange("O engajamento total (curtidas, comentários, salvamentos, compartilhamentos e reposts)", engagementOf(current), previous ? engagementOf(previous) : undefined),
    describeChange("As visitas ao perfil", current.profile_visits, previous?.profile_visits),
  ];
}
