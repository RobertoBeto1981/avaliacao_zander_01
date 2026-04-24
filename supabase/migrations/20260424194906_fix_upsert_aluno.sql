CREATE OR REPLACE FUNCTION public.upsert_aluno_dialog(
  p_evo_id text,
  p_nome_cliente text,
  p_telefone_cliente text,
  p_professor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_av_id uuid;
  v_status text;
  v_prof uuid;
BEGIN
  -- Procura por uma avaliação ativa com o mesmo evo_id
  SELECT id, status, professor_id INTO v_av_id, v_status, v_prof
  FROM public.avaliacoes
  WHERE evo_id = p_evo_id AND status IN ('pendente', 'em_progresso')
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    IF p_professor_id IS NOT NULL THEN
      IF v_prof IS NULL THEN
        UPDATE public.avaliacoes SET professor_id = p_professor_id WHERE id = v_av_id;
        RETURN jsonb_build_object('success', true, 'message', 'Aluno já existia e foi vinculado ao seu perfil.', 'id', v_av_id);
      ELSIF v_prof = p_professor_id THEN
        RETURN jsonb_build_object('success', true, 'message', 'Aluno já está vinculado ao seu perfil.', 'id', v_av_id);
      ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Este ID EVO já está vinculado a outro professor ou atendimento ativo.', 'id', v_av_id);
      END IF;
    ELSE
      RETURN jsonb_build_object('success', true, 'message', 'Aluno já existe no sistema.', 'id', v_av_id);
    END IF;
  ELSE
    -- Insere nova avaliação
    INSERT INTO public.avaliacoes (
      evo_id, 
      nome_cliente, 
      telefone_cliente, 
      status, 
      professor_id, 
      is_pre_avaliacao
    )
    VALUES (
      p_evo_id, 
      UPPER(p_nome_cliente), 
      p_telefone_cliente, 
      'pendente', 
      p_professor_id, 
      true
    )
    RETURNING id INTO v_av_id;

    RETURN jsonb_build_object('success', true, 'message', 'Aluno registrado com sucesso.', 'id', v_av_id);
  END IF;
END;
$function$;
