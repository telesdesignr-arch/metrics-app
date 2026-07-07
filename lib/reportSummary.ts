import { MetricEntry } from "./types";

function pct(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function describeChange(label: string, current: number, previous: number | undefined): string {
  if (previous === undefined) {
    return `${label}: ${current.toLocaleString("pt-BR")} (primeiro mês registrado, ainda sem comparação).`;
  }
  const diff = current - previous;
  const p = pct(current, previous);
  const direction = diff > 0 ? "subiu" : diff < 0 ? "caiu" : "ficou estável";
  const pctText = p !== null ? ` (${diff > 0 ? "+" : ""}${p.toFixed(0)}%)` : "";
  return `${label} ${direction} para ${current.toLocaleString("pt-BR")}${pctText} em relação ao mês anterior.`;
}

export function buildMonthlySummary(
  current: MetricEntry,
  previous: MetricEntry | undefined
): string[] {
  const engagementCurrent = current.likes + current.comments + current.shares + current.saves;
  const engagementPrevious = previous
    ? previous.likes + previous.comments + previous.shares + previous.saves
    : undefined;

  return [
    describeChange("O número de seguidores", current.followers, previous?.followers),
    describeChange("O alcance das publicações", current.reach, previous?.reach),
    describeChange("O engajamento total (curtidas, comentários, compartilhamentos e salvamentos)", engagementCurrent, engagementPrevious),
    describeChange("As visitas ao perfil", current.profile_visits, previous?.profile_visits),
  ];
}
