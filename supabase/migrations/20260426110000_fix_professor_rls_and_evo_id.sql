-- Fix RLS to allow professors to update pre-evaluations that have no professor assigned
DROP POLICY IF EXISTS "Professors can update assigned avaliacoes" ON public.avaliacoes;
CREATE POLICY "Professors can update assigned avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND 'professor' = ANY (users.roles)
    )
    AND (
      professor_id = auth.uid() 
      OR (is_pre_avaliacao = true AND professor_id IS NULL)
    )
  );

-- Fix any potential trailing spaces in evo_id across the database to prevent exact match issues
UPDATE public.avaliacoes 
SET evo_id = trim(evo_id) 
WHERE evo_id IS NOT NULL AND evo_id != trim(evo_id);
