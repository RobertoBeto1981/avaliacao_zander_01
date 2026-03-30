-- Adiciona a coluna nao_cliente na tabela de avaliacoes para identificar alunos não matriculados
ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS nao_cliente BOOLEAN NOT NULL DEFAULT false;
