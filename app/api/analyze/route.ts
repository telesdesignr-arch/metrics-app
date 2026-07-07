import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionValue } from "@/lib/auth";
import { MetricEntry } from "@/lib/types";
import { buildAnalysisPrompt } from "@/lib/buildPrompt";
import { getSupabaseServerClient } from "@/lib/supabase";
import { callGeminiWithFallback } from "@/lib/gemini";

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
    const analysis = await callGeminiWithFallback(prompt, apiKey, process.env.GEMINI_MODEL);

    // Salva a análise associada ao mês mais recente do histórico enviado.
    const latestMonth = metrics[metrics.length - 1].month;
    try {
      const supabase = getSupabaseServerClient();
      await supabase
        .from("analyses")
        .upsert({ month: latestMonth, analysis }, { onConflict: "month" });
    } catch (saveErr) {
      // Não falha a requisição só porque o salvamento deu problema —
      // a pessoa ainda quer ver a análise na tela.
      console.error("Erro ao salvar análise:", saveErr);
    }

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
