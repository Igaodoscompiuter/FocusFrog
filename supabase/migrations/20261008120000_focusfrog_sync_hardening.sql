-- Sincronização do FocusFrog: 1 linha por pessoa em public.profiles
-- (id = auth.users.id, data = foto completa dos dados do app).

alter table public.profiles add column if not exists app_version text;

-- Visitante sem login não tem nada a fazer aqui (nem descobrir a tabela).
revoke all on table public.profiles from anon;
grant select, insert, update, delete on table public.profiles to authenticated;

-- Regra única: cada pessoa logada só lê/escreve a própria linha.
-- (select auth.uid()) é avaliado 1x por consulta, não 1x por linha.
drop policy if exists "Allow individual user access to their own data" on public.profiles;
create policy "profiles: dono le e escreve a propria linha"
  on public.profiles for all
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

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
