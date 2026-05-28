DO $$
BEGIN
  -- Ensure the table has RLS enabled
  ALTER TABLE public.avaliacao_acompanhamentos ENABLE ROW LEVEL SECURITY;
END $$;

DROP POLICY IF EXISTS "Coordinators can delete acompanhamentos" ON public.avaliacao_acompanhamentos;
CREATE POLICY "Coordinators can delete acompanhamentos" ON public.avaliacao_acompanhamentos
  FOR DELETE TO authenticated USING (EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND ('coordenador'::text = ANY (users.roles) OR users.role = 'coordenador'::public.user_role) ));
