CREATE OR REPLACE FUNCTION public.auto_assign_professor()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  selected_prof_id UUID;
BEGIN
  -- Só distribui se for uma avaliação real (não pré-avaliação) e se não tiver professor
  IF NEW.is_pre_avaliacao = false AND NEW.professor_id IS NULL AND NEW.periodo_treino IS NOT NULL THEN
    -- Tenta encontrar um professor que tenha o período correspondente nos seus periodos E ESTEJA ATIVO
    SELECT u.id INTO selected_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE 'professor' = ANY(u.roles) AND NEW.periodo_treino = ANY(u.periodos) AND u.ativo = true
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

    -- Se não encontrar por período, pega qualquer professor ativo com menos avaliações
    IF selected_prof_id IS NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE 'professor' = ANY(u.roles) AND u.ativo = true
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
