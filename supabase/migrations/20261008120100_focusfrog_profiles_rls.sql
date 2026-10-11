-- PENDENTE: remove permissões, precisa de confirmação no Supabase.
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
