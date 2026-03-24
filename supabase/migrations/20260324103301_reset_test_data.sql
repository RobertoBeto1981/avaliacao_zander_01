-- Limpeza de base de dados para testes
-- Remove todas as avaliações e todos os usuários, mantendo apenas o Coordenador principal.

DO $$
BEGIN
  -- 1. Remover todas as avaliações (e dados atrelados via cascade: reavaliacoes, links, agendamentos, etc)
  DELETE FROM public.avaliacoes;
  
  -- Remover também da tabela antiga/legado se houver algo
  DELETE FROM public.evaluations;

  -- 2. Remover todas as comunicações e notificações
  DELETE FROM public.notifications;
  DELETE FROM public.bulk_messages;

  -- 3. Remover todos os usuários exceto o coordenador
  -- Isso irá limpar automaticamente a tabela public.users através do ON DELETE CASCADE
  DELETE FROM auth.users WHERE email != 'personalbeto@hotmail.com';

END $$;
