CREATE TABLE IF NOT EXISTS public.professor_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evitar duplicidade de solicitações pendentes
CREATE UNIQUE INDEX IF NOT EXISTS idx_prof_change_req_pendente ON public.professor_change_requests (avaliacao_id, professor_id) WHERE status = 'pendente';

ALTER TABLE public.professor_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert" ON public.professor_change_requests;
CREATE POLICY "authenticated_insert" ON public.professor_change_requests
  FOR INSERT TO authenticated WITH CHECK (professor_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_select" ON public.professor_change_requests;
CREATE POLICY "authenticated_select" ON public.professor_change_requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "coordenador_update" ON public.professor_change_requests;
CREATE POLICY "coordenador_update" ON public.professor_change_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles))
  );
