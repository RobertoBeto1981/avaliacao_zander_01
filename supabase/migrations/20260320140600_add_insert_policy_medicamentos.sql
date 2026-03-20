DROP POLICY IF EXISTS "authenticated_insert" ON public.medicamentos;

CREATE POLICY "authenticated_insert" ON public.medicamentos
  FOR INSERT TO authenticated WITH CHECK (true);
