-- The previous policy "Coordinators can manage users" was FOR ALL, 
-- which included SELECT. When it evaluated the EXISTS (SELECT ... FROM public.users) clause,
-- it triggered the SELECT policies again, causing an infinite recursion.
-- We fix this by dropping the FOR ALL policy and creating specific ones for INSERT, UPDATE, and DELETE.
-- SELECT is already safely covered by the existing "Users can read all users" policy (USING true).

DROP POLICY IF EXISTS "Coordinators can manage users" ON public.users;

DROP POLICY IF EXISTS "Coordinators can insert users" ON public.users;
CREATE POLICY "Coordinators can insert users" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'));

DROP POLICY IF EXISTS "Coordinators can update users" ON public.users;
CREATE POLICY "Coordinators can update users" ON public.users
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'));

DROP POLICY IF EXISTS "Coordinators can delete users" ON public.users;
CREATE POLICY "Coordinators can delete users" ON public.users
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'));
