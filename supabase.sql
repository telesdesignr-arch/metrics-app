-- Execute este código dentro do Supabase, em: SQL Editor > New query
-- Isso cria a tabela onde as métricas mensais serão guardadas.

create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  followers integer not null default 0,
  new_followers integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  profile_visits integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  posts_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Impede duplicar o mesmo mês (o formulário sempre usa o dia 01 do mês)
comment on column metrics.month is 'Primeiro dia do mês de referência, ex: 2026-07-01';
