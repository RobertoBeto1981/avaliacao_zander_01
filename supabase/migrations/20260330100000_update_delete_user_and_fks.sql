-- 1. Drop existing FKs and recreate them with ON DELETE SET NULL to preserve evaluations
ALTER TABLE public.avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_avaliador_id_fkey;
ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_avaliador_id_fkey FOREIGN KEY (avaliador_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_professor_id_fkey;
ALTER TABLE public.avaliacoes ADD CONSTRAINT avaliacoes_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Update delete_user_completely function to redistribute professor's clients
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_av RECORD;
  selected_prof_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)) THEN
    RAISE EXCEPTION 'Apenas coordenadores podem excluir usuários do sistema.';
  END IF;

  -- Redistribute professor's avaliacoes
  FOR v_av IN SELECT * FROM public.avaliacoes WHERE professor_id = target_user_id AND status IN ('pendente', 'em_progresso') LOOP
    selected_prof_id := NULL;
    
    -- Tenta encontrar professor pelo mesmo periodo
    IF v_av.periodo_treino IS NOT NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE 'professor' = ANY(u.roles) 
        AND v_av.periodo_treino = ANY(u.periodos) 
        AND u.ativo = true 
        AND u.id != target_user_id
      GROUP BY u.id
      ORDER BY COUNT(a.id) ASC
      LIMIT 1;
    END IF;

    -- Se não encontrar no mesmo periodo, busca o com menor carga
    IF selected_prof_id IS NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE 'professor' = ANY(u.roles) 
        AND u.ativo = true 
        AND u.id != target_user_id
      GROUP BY u.id
      ORDER BY COUNT(a.id) ASC
      LIMIT 1;
    END IF;

    -- Atualiza
    IF selected_prof_id IS NOT NULL THEN
      UPDATE public.avaliacoes SET professor_id = selected_prof_id WHERE id = v_av.id;
    ELSE
      UPDATE public.avaliacoes SET professor_id = NULL WHERE id = v_av.id;
    END IF;
  END LOOP;

  -- Remove from auth.users (cascades to public.users but preserves evaluations)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$;
