-- RBAC Policies for avaliacoes

DROP POLICY IF EXISTS "Anyone can update pre-evaluations" ON public.avaliacoes;
DROP POLICY IF EXISTS "Anyone can view pre-evaluations" ON public.avaliacoes;
DROP POLICY IF EXISTS "Coordinators can view all avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professors can update assigned avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professors can view assigned avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Users can manage their own avaliacoes" ON public.avaliacoes;

-- Coordinators: Full Access
CREATE POLICY "Coordinators have full access to avaliacoes" ON public.avaliacoes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  );

-- Avaliadores: Can read all and manage their own
CREATE POLICY "Avaliadores can read all avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'avaliador')
  );

CREATE POLICY "Avaliadores can insert avaliacoes" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'avaliador')
  );

CREATE POLICY "Avaliadores can update avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'avaliador')
  );

-- Professors: Can view assigned and update status/observations
CREATE POLICY "Professors can view assigned avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor') AND
    professor_id = auth.uid()
  );

CREATE POLICY "Professors can update assigned avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor') AND
    professor_id = auth.uid()
  );

-- Professors: Can insert pre-evaluations
CREATE POLICY "Professors can insert pre-evaluations" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor') AND
    is_pre_avaliacao = true
  );

-- Everyone: Can view pre-evaluations (needed for the new evaluation search feature)
CREATE POLICY "Everyone can view pre-evaluations" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    is_pre_avaliacao = true
  );

-- Fallback for users managing their own created records just in case
CREATE POLICY "Users can manage their own avaliacoes" ON public.avaliacoes
  FOR ALL TO authenticated USING (
    avaliador_id = auth.uid()
  ) WITH CHECK (
    avaliador_id = auth.uid()
  );
