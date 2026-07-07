import { createClient } from "@supabase/supabase-js";

// Este client usa a chave "service role", que só deve ser usada em rotas de API
// (nunca no navegador). Ele tem permissão total de leitura/escrita no banco.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
