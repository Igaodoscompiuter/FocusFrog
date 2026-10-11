-- Sincronização do FocusFrog: 1 linha por pessoa em public.profiles
-- (id = auth.users.id, data = dados do app em JSON, ver src/sync/userDataKeys.ts).
-- APLICADA em 2026-10-08.

alter table public.profiles add column if not exists app_version text;

-- Função do gatilho com search_path fixo (evita sequestro de função).
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
