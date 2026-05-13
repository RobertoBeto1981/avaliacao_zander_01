-- Drop the previous restrictive policy
DROP POLICY IF EXISTS "Users can manage links of their avaliacoes" ON public.links_avaliacao;

-- Allow Coordinators to manage links
DROP POLICY IF EXISTS "Coordinators can manage links" ON public.links_avaliacao;
CREATE POLICY "Coordinators can manage links" ON public.links_avaliacao
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND 'coordenador' = ANY (users.roles)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND 'coordenador' = ANY (users.roles)
    )
  );

-- Allow Avaliadores to manage links
DROP POLICY IF EXISTS "Avaliadores can manage links" ON public.links_avaliacao;
CREATE POLICY "Avaliadores can manage links" ON public.links_avaliacao
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND 'avaliador' = ANY (users.roles)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND 'avaliador' = ANY (users.roles)
    )
  );

-- Allow Fisioterapeutas and Nutricionistas to manage links
DROP POLICY IF EXISTS "Fisio and Nutri can manage links" ON public.links_avaliacao;
CREATE POLICY "Fisio and Nutri can manage links" ON public.links_avaliacao
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.roles && ARRAY['fisioterapeuta'::text, 'nutricionista'::text])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.roles && ARRAY['fisioterapeuta'::text, 'nutricionista'::text])
    )
  );

-- Allow Assigned Professors to manage links
DROP POLICY IF EXISTS "Professors can manage links of assigned avaliacoes" ON public.links_avaliacao;
CREATE POLICY "Professors can manage links of assigned avaliacoes" ON public.links_avaliacao
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a 
      WHERE a.id = links_avaliacao.avaliacao_id 
        AND (a.professor_id = auth.uid() OR (a.is_pre_avaliacao = true AND a.professor_id IS NULL))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a 
      WHERE a.id = links_avaliacao.avaliacao_id 
        AND (a.professor_id = auth.uid() OR (a.is_pre_avaliacao = true AND a.professor_id IS NULL))
    )
  );

-- Re-add the policy for the original creator (backward compatibility)
DROP POLICY IF EXISTS "Users can manage links of their avaliacoes" ON public.links_avaliacao;
CREATE POLICY "Users can manage links of their avaliacoes" ON public.links_avaliacao
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes
      WHERE avaliacoes.id = links_avaliacao.avaliacao_id AND avaliacoes.avaliador_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avaliacoes
      WHERE avaliacoes.id = links_avaliacao.avaliacao_id AND avaliacoes.avaliador_id = auth.uid()
    )
  );
