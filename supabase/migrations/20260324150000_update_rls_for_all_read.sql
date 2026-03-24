-- Drop old specific select policies
DROP POLICY IF EXISTS "Professors can view assigned avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Avaliadores can read all avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Everyone can view pre-evaluations" ON public.avaliacoes;

-- Create new policy to allow all authenticated users to read all avaliacoes
-- This is necessary so the "Início" page can show all clients to any logged-in user
CREATE POLICY "Authenticated users can read all avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (true);
