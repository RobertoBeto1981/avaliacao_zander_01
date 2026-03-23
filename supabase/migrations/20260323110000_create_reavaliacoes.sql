CREATE TABLE IF NOT EXISTS public.reavaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_original_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  data_reavaliacao DATE NOT NULL,
  respostas_novas JSONB NOT NULL,
  evolucao JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reavaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.reavaliacoes;
CREATE POLICY "Allow select for authenticated" ON public.reavaliacoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.reavaliacoes;
CREATE POLICY "Allow insert for authenticated" ON public.reavaliacoes
  FOR INSERT TO authenticated WITH CHECK (true);

