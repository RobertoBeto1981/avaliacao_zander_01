-- Allow fisioterapeuta and nutricionista to read all avaliacoes
DROP POLICY IF EXISTS "Fisio and Nutri can read all avaliacoes" ON public.avaliacoes;
CREATE POLICY "Fisio and Nutri can read all avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('fisioterapeuta', 'nutricionista') ));

-- Allow fisioterapeuta and nutricionista to read all links_avaliacao
DROP POLICY IF EXISTS "Fisio and Nutri can view all links" ON public.links_avaliacao;
CREATE POLICY "Fisio and Nutri can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated
  USING (EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('fisioterapeuta', 'nutricionista') ));
