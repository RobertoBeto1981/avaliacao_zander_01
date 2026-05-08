CREATE OR REPLACE FUNCTION public.import_aluno_csv_safely(
  p_evo_id text, 
  p_nome_cliente text, 
  p_telefone_cliente text, 
  p_professor_id uuid
)
RETURNS jsonb
SECURITY DEFINER
AS $$
DECLARE
  v_av_id uuid;
  v_nome_upper text := UPPER(TRIM(p_nome_cliente));
  v_tel_clean text := TRIM(p_telefone_cliente);
BEGIN
  -- Verifica se já existe por EVO ID (se não for nulo/vazio)
  IF p_evo_id IS NOT NULL AND p_evo_id <> '' THEN
    SELECT id INTO v_av_id FROM public.avaliacoes WHERE evo_id = p_evo_id LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('status', 'ignored', 'reason', 'evo_id_exists', 'id', v_av_id);
    END IF;
  END IF;

  -- Verifica se já existe por Nome
  IF v_nome_upper IS NOT NULL AND v_nome_upper <> '' THEN
    SELECT id INTO v_av_id FROM public.avaliacoes WHERE UPPER(nome_cliente) = v_nome_upper LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('status', 'ignored', 'reason', 'name_exists', 'id', v_av_id);
    END IF;
  END IF;

  -- Verifica se já existe por Telefone
  IF v_tel_clean IS NOT NULL AND v_tel_clean <> '' THEN
    SELECT id INTO v_av_id FROM public.avaliacoes WHERE telefone_cliente = v_tel_clean LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('status', 'ignored', 'reason', 'phone_exists', 'id', v_av_id);
    END IF;
  END IF;

  -- Se não existe, insere
  INSERT INTO public.avaliacoes (
    evo_id, 
    nome_cliente, 
    telefone_cliente, 
    status, 
    professor_id, 
    is_pre_avaliacao
  )
  VALUES (
    NULLIF(p_evo_id, ''), 
    v_nome_upper, 
    NULLIF(v_tel_clean, ''), 
    'pendente', 
    p_professor_id, 
    true
  )
  RETURNING id INTO v_av_id;

  RETURN jsonb_build_object('status', 'inserted', 'id', v_av_id);
END;
$$ LANGUAGE plpgsql;
