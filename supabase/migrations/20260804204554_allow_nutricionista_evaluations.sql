-- Allow nutricionista role to insert and update avaliacoes (same as avaliador)

DROP POLICY IF EXISTS "Avaliadores can insert avaliacoes" ON public.avaliacoes;
CREATE POLICY "Avaliadores can insert avaliacoes" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (
        'avaliador' = ANY(roles) OR 'nutricionista' = ANY(roles)
      )
    )
  );

DROP POLICY IF EXISTS "Avaliadores can update avaliacoes" ON public.avaliacoes;
CREATE POLICY "Avaliadores can update avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (
        'avaliador' = ANY(roles) OR 'nutricionista' = ANY(roles)
      )
    )
  );
