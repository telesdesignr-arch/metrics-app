import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionValue } from "@/lib/auth";
import { MetricEntry } from "@/lib/types";
import { buildAnalysisPrompt } from "@/lib/buildPrompt";

async function checkAuth(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return isValidSessionValue(session);
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY não configurada no servidor. Adicione essa variável de ambiente na Vercel.",
        },
        { status: 500 }
      );
    }

    const prompt = buildAnalysisPrompt(metrics);
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API do Gemini (modelo: ${model}): ${errText}`);
    }

    const data = await response.json();
    const analysis =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar a análise.";

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
