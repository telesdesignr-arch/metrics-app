import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionValue } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase";
import { buildComparisonPrompt } from "@/lib/buildPrompt";

async function checkAuth(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return isValidSessionValue(session);
}

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.slice(0, 7).split("-");
  const names = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${names[Number(month) - 1]} de ${year}`;
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { month } = (await request.json()) as { month: string };

    if (!month) {
      return NextResponse.json({ error: "Mês não informado." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Busca todas as análises até o mês atual, ordenadas, pra achar a anterior.
    const { data: allAnalyses, error: listError } = await supabase
      .from("analyses")
      .select("*")
      .lte("month", month)
      .order("month", { ascending: true });

    if (listError) throw listError;

    const currentEntry = allAnalyses?.find((a) => a.month === month);
    const currentIdx = allAnalyses?.findIndex((a) => a.month === month) ?? -1;
    const previousEntry = currentIdx > 0 ? allAnalyses![currentIdx - 1] : null;

    if (!currentEntry) {
      return NextResponse.json(
        {
          error:
            "Ainda não existe uma análise salva para este mês. Clique em \"Gerar análise com IA\" primeiro.",
        },
        { status: 400 }
      );
    }

    if (!previousEntry) {
      return NextResponse.json(
        {
          error:
            "Não encontramos uma análise salva do mês anterior para comparar. Gere a análise do mês anterior primeiro (ou este é o primeiro mês registrado).",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const prompt = buildComparisonPrompt(
      formatMonthLabel(currentEntry.month),
      currentEntry.analysis,
      formatMonthLabel(previousEntry.month),
      previousEntry.analysis
    );

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
    const comparison =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar a comparação.";

    return NextResponse.json({ comparison });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
