CREATE TABLE IF NOT EXISTS public.avaliacao_acompanhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  observacao TEXT NOT NULL,
  prazo DATE,
  concluido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluido_em TIMESTAMPTZ
);

ALTER TABLE public.avaliacao_acompanhamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.avaliacao_acompanhamentos;
CREATE POLICY "Allow select for authenticated" ON public.avaliacao_acompanhamentos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.avaliacao_acompanhamentos;
CREATE POLICY "Allow insert for authenticated" ON public.avaliacao_acompanhamentos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for authenticated" ON public.avaliacao_acompanhamentos;
CREATE POLICY "Allow update for authenticated" ON public.avaliacao_acompanhamentos
  FOR UPDATE TO authenticated USING (true);

