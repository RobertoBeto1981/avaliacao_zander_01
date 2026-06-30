CREATE OR REPLACE FUNCTION public.redistribute_professor_students(p_professor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student RECORD;
  v_target_prof_id uuid;
  v_moved_count int := 0;
  v_failed_names text[] := '{}';
  v_failed_shifts text[] := '{}';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)) THEN
    RAISE EXCEPTION 'Apenas coordenadores podem redistribuir alunos.';
  END IF;

  FOR v_student IN
    SELECT id, nome_cliente, periodo_treino
    FROM public.avaliacoes
    WHERE professor_id = p_professor_id
    AND status IN ('pendente', 'em_progresso')
  LOOP
    SELECT u.id INTO v_target_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE 'professor' = ANY(u.roles)
      AND NOT ('coordenador' = ANY(u.roles))
      AND u.id != p_professor_id
      AND u.ativo = true
      AND (
        v_student.periodo_treino IS NULL
        OR v_student.periodo_treino = ANY(u.periodos)
      )
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

    IF v_target_prof_id IS NOT NULL THEN
      UPDATE public.avaliacoes
      SET professor_id = v_target_prof_id
      WHERE id = v_student.id;
      v_moved_count := v_moved_count + 1;
    ELSE
      v_failed_names := array_append(v_failed_names, v_student.nome_cliente);
      IF v_student.periodo_treino IS NOT NULL THEN
        v_failed_shifts := array_append(v_failed_shifts, v_student.periodo_treino);
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'moved_count', v_moved_count,
    'failed_names', to_jsonb(v_failed_names),
    'failed_shifts', to_jsonb(array(SELECT DISTINCT unnest(v_failed_shifts)))
  );
END;
$$;
