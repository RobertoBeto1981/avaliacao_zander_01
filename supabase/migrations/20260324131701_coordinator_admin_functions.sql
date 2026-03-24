-- Substituir a política para permitir que coordenadores gerenciem (atualizem) usuários livremente
DROP POLICY IF EXISTS "Coordinators can manage users" ON public.users;
CREATE POLICY "Coordinators can manage users" ON public.users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador'));

-- Função segura (Security Definer) para permitir que um coordenador exclua permanentemente um usuário do Auth e da tabela public.users (via cascade)
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se quem chama é realmente um coordenador ativo
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador') THEN
    RAISE EXCEPTION 'Apenas coordenadores podem excluir usuários do sistema.';
  END IF;

  -- Deleta o usuário diretamente na tabela auth.users. 
  -- Por conta do ON DELETE CASCADE, a linha na public.users também sumirá.
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
