-- Create redistribute_professor_students function for transactional student redistribution
CREATE OR REPLACE FUNCTION public.redistribute_professor_students(p_professor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student RECORD;
  v_target_prof_id uuid;
  v_updated int := 0;
  v_failed_count int := 0;
  v_failed_shifts text[] := '{}';
  v_failed_students text[] := '{}';
BEGIN
  -- Verify caller is coordenador
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND 'coordenador' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Apenas coordenadores podem redistribuir alunos.';
  END IF;

  FOR v_student IN
    SELECT id, nome_cliente, periodo_treino
    FROM public.avaliacoes
    WHERE professor_id = p_professor_id
    AND status IN ('pendente', 'em_progresso')
  LOOP
    -- Find eligible professor with matching shift and lowest workload
    -- Excludes the source professor and coordinators
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
      v_updated := v_updated + 1;
    ELSE
      v_failed_count := v_failed_count + 1;
      IF v_student.periodo_treino IS NOT NULL AND NOT (v_student.periodo_treino = ANY(v_failed_shifts)) THEN
        v_failed_shifts := array_append(v_failed_shifts, v_student.periodo_treino);
      END IF;
      v_failed_students := array_append(v_failed_students, v_student.nome_cliente);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'updated', v_updated,
    'failed_count', v_failed_count,
    'failed_shifts', to_jsonb(v_failed_shifts),
    'failed_students', to_jsonb(v_failed_students)
  );
END;
$$;

-- Reinforce RLS: Coordinators have full access (including UPDATE) to avaliacoes
DROP POLICY IF EXISTS "Coordinators have full access to avaliacoes" ON public.avaliacoes;
CREATE POLICY "Coordinators have full access to avaliacoes" ON public.avaliacoes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

-- Reinforce RLS: All authenticated users can read users (SELECT)
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- Reinforce RLS: Coordinators can update users
DROP POLICY IF EXISTS "Coordinators can update users" ON public.users;
CREATE POLICY "Coordinators can update users" ON public.users
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));
