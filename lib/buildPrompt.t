import { MetricEntry } from "./types";

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${names[Number(month) - 1]} de ${year}`;
}

export function buildAnalysisPrompt(metrics: MetricEntry[]): string {
  const rows = metrics
    .map(
      (m) =>
        `- ${formatMonthLabel(m.month)}: seguidores=${m.followers} (novos=${m.new_followers}), alcance=${m.reach}, impressões=${m.impressions}, visitas ao perfil=${m.profile_visits}, curtidas=${m.likes}, comentários=${m.comments}, compartilhamentos=${m.shares}, salvamentos=${m.saves}, posts publicados=${m.posts_count}`
    )
    .join("\n");

  return `Você é um consultor de redes sociais especializado em contas de igrejas e eventos comunitários.

Abaixo está o histórico mensal de métricas do Instagram da Igreja Batista Atitude Méier (conta que também promove a Conferência Edificar, evento anual). O objetivo da conta é: fortalecer a igreja como comunidade de fé, gerar engajamento, atrair visitantes e fortalecer a presença da igreja no bairro do Méier, no Rio de Janeiro.

Histórico de métricas (mês a mês):
${rows}

Com base nesses dados, escreva uma análise em português, direta e prática, destinada a uma equipe de comunicação formada por pessoas leigas em marketing digital (não use jargão sem explicar). Estruture a resposta assim:

1. Resumo da evolução (2-3 frases sobre a tendência geral: crescendo, estável ou caindo)
2. Pontos positivos (o que está funcionando bem, com base nos números)
3. Pontos de atenção (o que caiu ou estagnou, e possíveis causas)
4. 3 a 5 recomendações práticas para o próximo mês, específicas para uma conta de igreja (não recomendações genéricas de marketing)

Seja específico usando os números fornecidos, não fale de forma vaga.`;
}
