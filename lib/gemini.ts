const FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callModel(model: string, prompt: string, apiKey: string) {
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
    const err: any = new Error(`Erro na API do Gemini (modelo: ${model}): ${errText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar a análise."
  );
}

/**
 * Chama o Gemini com resiliência: se o modelo preferido estiver sobrecarregado
 * (erro 503) ou com limite temporário (429), tenta de novo com um pequeno atraso
 * e, se persistir, cai para o próximo modelo da lista.
 */
export async function callGeminiWithFallback(
  prompt: string,
  apiKey: string,
  preferredModel?: string
): Promise<string> {
  const models = preferredModel
    ? [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)]
    : FALLBACK_MODELS;

  let lastError: any;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callModel(model, prompt, apiKey);
      } catch (err: any) {
        lastError = err;
        const isRetryable = err.status === 503 || err.status === 429;
        if (isRetryable && attempt === 0) {
          await sleep(1500);
          continue;
        }
        break; // não é retryable, ou já tentou de novo — passa pro próximo modelo
      }
    }
  }

  throw lastError;
}
