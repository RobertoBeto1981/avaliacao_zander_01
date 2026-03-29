-- Adiciona a coluna de múltiplos cargos pendentes na tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pending_roles text[] DEFAULT '{}'::text[];

-- Corrige o valor padrão do status da avaliação para 'pendente' em vez de 'concluido'
ALTER TABLE public.avaliacoes ALTER COLUMN status SET DEFAULT 'pendente'::public.avaliacao_status;
