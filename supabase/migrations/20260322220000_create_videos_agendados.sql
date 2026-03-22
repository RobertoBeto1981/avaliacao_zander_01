CREATE TABLE IF NOT EXISTS public.videos_agendados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  dias_apos_avaliacao INTEGER NOT NULL CHECK (dias_apos_avaliacao IN (1, 7, 30, 60, 90)),
  url_google_drive TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado')),
  data_envio TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.videos_agendados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coordinators can manage scheduled videos" ON public.videos_agendados;
CREATE POLICY "Coordinators can manage scheduled videos" ON public.videos_agendados
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'coordenador')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'coordenador')
  );
