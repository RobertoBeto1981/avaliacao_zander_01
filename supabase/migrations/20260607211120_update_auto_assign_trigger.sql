-- Update the auto_assign_professor trigger function to handle periodo_treino changes and status reset
CREATE OR REPLACE FUNCTION public.auto_assign_professor()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  selected_prof_id UUID;
BEGIN
  -- 1. Check for updates that require status reset or redistribution
  IF TG_OP = 'UPDATE' THEN
    -- If periodo_treino changed, set professor_id to NULL to force redistribution and reset status
    IF NEW.periodo_treino IS DISTINCT FROM OLD.periodo_treino THEN
      NEW.professor_id := NULL;
      NEW.status := 'pendente';
    END IF;

    -- If transitioning from pre-evaluation to evaluation, force status to pendente
    IF OLD.is_pre_avaliacao = true AND NEW.is_pre_avaliacao = false THEN
      NEW.status := 'pendente';
    END IF;
  END IF;

  -- 2. Só distribui se for uma avaliação real (não pré-avaliação) e se não tiver professor
  IF NEW.is_pre_avaliacao = false AND NEW.professor_id IS NULL AND NEW.periodo_treino IS NOT NULL THEN
    -- Tenta encontrar um professor que tenha o período correspondente nos seus periodos E ESTEJA ATIVO
    -- Filtro adicional: exclui sumariamente perfis que possuam a role de 'coordenador'
    SELECT u.id INTO selected_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE 'professor' = ANY(u.roles) 
      AND NOT ('coordenador' = ANY(u.roles))
      AND NEW.periodo_treino = ANY(u.periodos) 
      AND u.ativo = true
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

    -- Se não encontrar por período, pega qualquer professor ativo com menos avaliações
    IF selected_prof_id IS NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE 'professor' = ANY(u.roles) 
        AND NOT ('coordenador' = ANY(u.roles))
        AND u.ativo = true
      GROUP BY u.id
      ORDER BY COUNT(a.id) ASC
      LIMIT 1;
    END IF;

    NEW.professor_id := selected_prof_id;
  END IF;

  -- Define status inicial se estiver nulo (mesmo para pré-avaliação, garantindo a exibição correta no painel do professor)
  IF NEW.status IS NULL THEN
    NEW.status := 'pendente';
  END IF;

  RETURN NEW;
END;
$function$;

-- Apply fix for Aluno 209 as requested in acceptance criteria
DO $$
BEGIN
  UPDATE public.avaliacoes 
  SET 
    status = 'pendente', 
    professor_id = NULL 
  WHERE nome_cliente ILIKE '%Aluno 209%';
END $$;
