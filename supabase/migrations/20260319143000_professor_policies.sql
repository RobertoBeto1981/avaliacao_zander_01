-- Allow professors to view all avaliacoes so they can create training plans
CREATE POLICY "Professors can view all avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor')
  );

-- Allow professors to update the status of avaliacoes
CREATE POLICY "Professors can update avaliacoes status" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor')
  );

-- Allow professors to view all links related to the avaliacoes
CREATE POLICY "Professors can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor')
  );
