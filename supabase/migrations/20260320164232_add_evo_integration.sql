ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS evo_id TEXT;
ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS is_pre_avaliacao BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_evo_id ON public.avaliacoes(evo_id);

-- Permitir que avaliadores e qualquer usuário autenticado visualizem pré-avaliações
DROP POLICY IF EXISTS "Anyone can view pre-evaluations" ON public.avaliacoes;
CREATE POLICY "Anyone can view pre-evaluations" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (is_pre_avaliacao = true);

-- Permitir que avaliadores atualizem pré-avaliações (para convertê-las em avaliações reais)
DROP POLICY IF EXISTS "Anyone can update pre-evaluations" ON public.avaliacoes;
CREATE POLICY "Anyone can update pre-evaluations" ON public.avaliacoes
  FOR UPDATE TO authenticated
  USING (is_pre_avaliacao = true);
