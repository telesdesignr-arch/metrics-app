import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionValue } from "@/lib/auth";
import { MetricEntry } from "@/lib/types";

async function checkAuth(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return isValidSessionValue(session);
}

function buildPrompt(metrics: MetricEntry[]): string {
  const rows = metrics
    .map(
      (m) =>
        `- ${m.month}: seguidores=${m.followers} (novos=${m.new_followers}), alcance=${m.reach}, impressões=${m.impressions}, visitas ao perfil=${m.profile_visits}, curtidas=${m.likes}, comentários=${m.comments}, compartilhamentos=${m.shares}, salvamentos=${m.saves}, posts publicados=${m.posts_count}`
    )
    .join("\n");

  return `Você é um consultor de redes sociais especializado em contas de igrejas e eventos comunitários.

Abaixo está o histórico mensal de métricas do Instagram da Igreja Batista Atitude Méier (conta que também promove a Conferência Edificar, evento anual). O objetivo da conta é: fortalecer a igreja como comunidade de fé, gerar engajamento, atrair visitantes e fortalecer a presença da igreja no bairro do Méier, no Rio de Janeiro.

Histórico de métricas (mês a mês):
${rows}

Com base nesses dados, escreva uma análise em português, direta e prática, destinada a uma equipe de comunicação formada por pessoas leigas em marketing digital (não use jargão sem explicar). Estruture a resposta assim:

1. **Resumo da evolução** (2-3 frases sobre a tendência geral: crescendo, estável ou caindo)
2. **Pontos positivos** (o que está funcionando bem, com base nos números)
3. **Pontos de atenção** (o que caiu ou estagnou, e possíveis causas)
4. **3 a 5 recomendações práticas** para o próximo mês, específicas para uma conta de igreja (não recomendações genéricas de marketing)

Seja específico usando os números fornecidos, não fale de forma vaga.`;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { metrics } = (await request.json()) as { metrics: MetricEntry[] };

    if (!metrics || metrics.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma métrica encontrada para analisar." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY não configurada no servidor. Adicione essa variável de ambiente na Vercel.",
        },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(metrics);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API da OpenAI: ${errText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Não foi possível gerar a análise.";

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
