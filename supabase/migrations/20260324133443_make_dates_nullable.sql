-- Tornar as colunas data_avaliacao e data_reavaliacao opcionais para suportar o cadastro prévio de alunos
ALTER TABLE public.avaliacoes ALTER COLUMN data_avaliacao DROP NOT NULL;
ALTER TABLE public.avaliacoes ALTER COLUMN data_reavaliacao DROP NOT NULL;
