-- Fix empty strings to null for evo_id to avoid unique index issues
UPDATE public.avaliacoes SET evo_id = NULL WHERE evo_id = '';

-- Remove duplicate records by evo_id, keeping the newest one
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT evo_id FROM public.avaliacoes WHERE evo_id IS NOT NULL GROUP BY evo_id HAVING COUNT(*) > 1
    LOOP
        DELETE FROM public.avaliacoes 
        WHERE evo_id = r.evo_id 
        AND id NOT IN (
            SELECT id FROM public.avaliacoes WHERE evo_id = r.evo_id ORDER BY created_at DESC LIMIT 1
        );
    END LOOP;
END $$;

-- Drop and recreate index
DROP INDEX IF EXISTS public.avaliacoes_evo_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS avaliacoes_evo_id_unique ON public.avaliacoes USING btree (evo_id) WHERE (evo_id IS NOT NULL AND evo_id != '');

-- Update upsert function to strictly block
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
    -- Strict Duplicate Prevention
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Este aluno já existe no sistema. Utilize a busca geral para localizá-lo.', 
      'id', v_av_id, 
      'status', v_status
    );
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
