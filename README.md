# Painel de Métricas — Atitude Méier

Ferramenta interna para registrar as métricas mensais do Instagram, acompanhar
a evolução em gráficos, e gerar uma análise automática por IA com recomendações.

Só você e sua sócia têm acesso (login com senha compartilhada).

---

## O que essa ferramenta faz

- **Formulário mensal**: você digita os números que o Instagram já mostra no
  próprio app (Configurações > Ver desempenho/Insights): seguidores, alcance,
  impressões, curtidas, comentários, etc.
- **Dashboard**: mostra gráficos da evolução mês a mês.
- **Análise por IA**: um botão que envia todo o histórico para uma IA (ChatGPT)
  e recebe de volta uma análise em português, com pontos fortes, pontos de
  atenção e recomendações práticas.

---

## Passo a passo para colocar no ar

Você vai precisar de 3 contas gratuitas: **GitHub**, **Supabase** e **Vercel**.
Depois, uma chave da OpenAI (paga por uso, bem barato para esse volume).

### Passo 1 — Criar o banco de dados (Supabase)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New Project**. Dê um nome (ex: `atitude-meier-metricas`) e uma senha
   (guarde essa senha, mas ela não será usada no código).
3. Depois que o projeto for criado, vá em **SQL Editor** (menu lateral) > **New query**.
4. Abra o arquivo `supabase.sql` (está junto com esses arquivos), copie todo o
   conteúdo, cole no editor do Supabase e clique em **Run**.
5. Isso cria a tabela onde as métricas serão guardadas.
6. Vá em **Project Settings** (ícone de engrenagem) > **API**.
7. Copie dois valores, você vai precisar deles no Passo 3:
   - **Project URL** → isso é o `SUPABASE_URL`
   - **service_role key** (em "Project API keys", clique em "Reveal" para ver) → isso é o `SUPABASE_SERVICE_ROLE_KEY`

⚠️ A `service_role key` dá acesso total ao banco. Nunca compartilhe ela publicamente.

### Passo 2 — Subir o código para o GitHub

1. Crie uma conta em [github.com](https://github.com) (se ainda não tiver).
2. Crie um novo repositório (botão verde **New**), pode deixar como **Private**.
3. Suba os arquivos desse projeto para esse repositório (pelo site do GitHub
   mesmo, arrastando a pasta, ou usando o GitHub Desktop se preferir uma
   interface visual).

### Passo 3 — Publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta usando o mesmo login do GitHub.
2. Clique em **Add New** > **Project**.
3. Selecione o repositório que você acabou de criar no GitHub.
4. Antes de clicar em "Deploy", abra a seção **Environment Variables** e adicione,
   uma por uma:

   | Nome | Valor |
   |---|---|
   | `SUPABASE_URL` | (o Project URL que você copiou no Passo 1) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (a service_role key do Passo 1) |
   | `APP_PASSWORD` | uma senha que só você e sua sócia vão saber |
   | `AUTH_SECRET` | qualquer texto aleatório (ex: `xk92-atitude-meier-2026`) |
   | `OPENAI_API_KEY` | sua chave da OpenAI (veja Passo 4) |

5. Clique em **Deploy**. Em 1-2 minutos, a Vercel te dá um link (algo como
   `atitude-meier-metricas.vercel.app`) — esse é o site já no ar.

### Passo 4 — Criar a chave da OpenAI (para a análise por IA)

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Crie uma conta (ou entre, se já tiver).
3. Você precisa adicionar um cartão e colocar um crédito pequeno (a API é paga
   por uso — para esse tipo de análise mensal, o custo é de poucos centavos por vez).
4. Clique em **Create new secret key**, copie a chave (começa com `sk-...`) e
   cole no campo `OPENAI_API_KEY` na Vercel (Passo 3).

Se preferir não usar a OpenAI, dá para adaptar o código para usar a API da
Anthropic (Claude) — o arquivo a alterar é `app/api/analyze/route.ts`.

---

## Como usar no dia a dia

1. Acesse o link do site (o que a Vercel te deu).
2. Faça login com a senha (`APP_PASSWORD` que você definiu).
3. Todo mês, entre em **+ Nova métrica** e preencha os números do Instagram Insights.
4. No **Dashboard**, acompanhe os gráficos e clique em **Gerar análise com IA**
   sempre que quiser sugestões baseadas no histórico.

---

## Testar no seu computador antes de publicar (opcional)

Se quiser ver funcionando localmente antes de publicar:

```bash
npm install
cp .env.example .env.local
# edite o .env.local com seus valores reais
npm run dev
```

Depois acesse `http://localhost:3000` no navegador.

---

## Onde encontrar os números do Instagram (Insights)

No app do Instagram, na conta comercial/criador da igreja:
1. Toque no seu perfil > menu (☰) > **Configurações e privacidade** > **Ver desempenho** (ou **Insights**, dependendo da versão do app).
2. Lá você encontra: contas alcançadas (alcance), impressões, visitas ao perfil,
   e o desempenho de cada post (curtidas, comentários, compartilhamentos, salvamentos).
3. Some os números do mês inteiro antes de digitar no formulário.
