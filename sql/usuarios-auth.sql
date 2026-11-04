-- Migração: papéis e senhas com hash na tabela usuarios.
-- Rode no SQL Editor do Supabase (projeto achados-perdidos).
-- Senhas antigas em texto claro continuam válidas: no próximo login
-- o backend troca automaticamente pelo hash bcrypt.

alter table public.usuarios
  add column if not exists papel text not null default 'usuario';

alter table public.usuarios
  drop constraint if exists usuarios_papel_check;

alter table public.usuarios
  add constraint usuarios_papel_check
  check (papel in ('admin', 'usuario'));

comment on column public.usuarios.papel is 'admin = secretaria (gerenciar); usuario = só reivindicar/cadastrar';
comment on column public.usuarios.senha is 'Hash bcrypt ($2a$...); legado em texto claro é re-hasheado no login';

-- Opcional: promover um login existente a admin (troque o login):
-- update public.usuarios set papel = 'admin' where login = 'secretaria';
