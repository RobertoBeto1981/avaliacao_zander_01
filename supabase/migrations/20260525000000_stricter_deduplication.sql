-- Function to handle upsert with stricter deduplication logic
CREATE OR REPLACE FUNCTION public.upsert_aluno_dialog(p_evo_id text, p_nome_cliente text, p_telefone_cliente text, p_professor_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_av_id uuid;
  v_status text;
  v_prof uuid;
  v_nome_upper text := UPPER(btrim(p_nome_cliente));
  v_tel_clean text := btrim(p_telefone_cliente);
  v_evo_clean text := NULLIF(btrim(p_evo_id), '');
BEGIN
  -- Tenta achar por EVO ID primeiro
  IF v_evo_clean IS NOT NULL THEN
    SELECT id, status, professor_id INTO v_av_id, v_status, v_prof
    FROM public.avaliacoes
    WHERE evo_id = v_evo_clean
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Se não achou por EVO ID, tenta por Nome (case-insensitive)
  IF v_av_id IS NULL AND v_nome_upper IS NOT NULL AND v_nome_upper <> '' THEN
    SELECT id, status, professor_id INTO v_av_id, v_status, v_prof
    FROM public.avaliacoes
    WHERE UPPER(btrim(nome_cliente)) = v_nome_upper
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_av_id IS NOT NULL THEN
    IF v_status = 'concluido' THEN
      RETURN jsonb_build_object('success', true, 'message', 'Aluno encontrado com histórico. Redirecionando para Reavaliação/Edição.', 'id', v_av_id, 'status', v_status);
    END IF;

    IF p_professor_id IS NOT NULL THEN
      IF v_prof IS NULL THEN
        UPDATE public.avaliacoes SET professor_id = p_professor_id WHERE id = v_av_id;
        RETURN jsonb_build_object('success', true, 'message', 'Aluno já existia e foi vinculado ao seu perfil.', 'id', v_av_id, 'status', v_status);
      ELSIF v_prof = p_professor_id THEN
        RETURN jsonb_build_object('success', true, 'message', 'Aluno já está vinculado ao seu perfil.', 'id', v_av_id, 'status', v_status);
      ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Este aluno (EVO/Nome) já está vinculado a outro professor ou atendimento ativo.', 'id', v_av_id, 'status', v_status);
      END IF;
    ELSE
      RETURN jsonb_build_object('success', true, 'message', 'Aluno já existe no sistema.', 'id', v_av_id, 'status', v_status);
    END IF;
  ELSE
    INSERT INTO public.avaliacoes (
      evo_id, 
      nome_cliente, 
      telefone_cliente, 
      status, 
      professor_id, 
      is_pre_avaliacao
    )
    VALUES (
      v_evo_clean, 
      v_nome_upper, 
      NULLIF(v_tel_clean, ''), 
      'pendente', 
      p_professor_id, 
      true
    )
    RETURNING id INTO v_av_id;

    RETURN jsonb_build_object('success', true, 'message', 'Aluno registrado com sucesso.', 'id', v_av_id, 'status', 'pendente');
  END IF;
END;
$function$;

-- Function for CSV import with stricter deduplication logic
CREATE OR REPLACE FUNCTION public.import_aluno_csv_safely(p_evo_id text, p_nome_cliente text, p_telefone_cliente text, p_professor_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_av_id uuid;
  v_status text;
  v_nome_upper text := UPPER(btrim(p_nome_cliente));
  v_tel_clean text := btrim(p_telefone_cliente);
  v_evo_clean text := NULLIF(btrim(p_evo_id), '');
BEGIN
  IF v_evo_clean IS NOT NULL THEN
    SELECT id, status INTO v_av_id, v_status FROM public.avaliacoes WHERE evo_id = v_evo_clean LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('status', 'ignored', 'reason', 'evo_id_exists', 'id', v_av_id, 'avaliacao_status', v_status);
    END IF;
  END IF;

  IF v_nome_upper IS NOT NULL AND v_nome_upper <> '' THEN
    SELECT id, status INTO v_av_id, v_status FROM public.avaliacoes WHERE UPPER(btrim(nome_cliente)) = v_nome_upper LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('status', 'ignored', 'reason', 'name_exists', 'id', v_av_id, 'avaliacao_status', v_status);
    END IF;
  END IF;

  INSERT INTO public.avaliacoes (
    evo_id, 
    nome_cliente, 
    telefone_cliente, 
    status, 
    professor_id, 
    is_pre_avaliacao
  )
  VALUES (
    v_evo_clean, 
    v_nome_upper, 
    NULLIF(v_tel_clean, ''), 
    'pendente', 
    p_professor_id, 
    true
  )
  RETURNING id INTO v_av_id;

  RETURN jsonb_build_object('status', 'inserted', 'id', v_av_id);
END;
$function$;

-- Cleanup script for existing duplicates safely
DO $$
BEGIN
  -- Elimina registros duplicados antigos e que não tem nenhuma anotação atrelada a eles,
  -- mantendo a versão mais atual caso o mesmo nome já exista (deduplicação)
  DELETE FROM public.avaliacoes a1
  WHERE a1.is_pre_avaliacao = true 
    AND a1.status = 'pendente' 
    AND a1.professor_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.avaliacao_acompanhamentos aa WHERE aa.avaliacao_id = a1.id)
    AND EXISTS (
      SELECT 1 FROM public.avaliacoes a2
      WHERE UPPER(btrim(a1.nome_cliente)) = UPPER(btrim(a2.nome_cliente))
        AND a1.id != a2.id
        AND a1.created_at < a2.created_at
    );
END $$;
