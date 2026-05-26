DO $BODY$
DECLARE
  dup_record RECORD;
  master_id UUID;
  child_id UUID;
  arr_len INT;
  i INT;
  master_record RECORD;
  child_record RECORD;
BEGIN
  -- 1. Merge duplicates by evo_id
  FOR dup_record IN 
    SELECT evo_id, array_agg(id ORDER BY created_at DESC) as ids
    FROM public.avaliacoes
    WHERE evo_id IS NOT NULL AND evo_id <> ''
    GROUP BY evo_id
    HAVING COUNT(*) > 1
  LOOP
    master_id := dup_record.ids[1];
    arr_len := array_length(dup_record.ids, 1);
    
    FOR i IN 2..arr_len LOOP
      child_id := dup_record.ids[i];
      
      -- Redirect dependencies
      UPDATE public.avaliacao_history SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.links_avaliacao SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.avaliacao_acompanhamentos SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.reavaliacoes SET avaliacao_original_id = master_id WHERE avaliacao_original_id = child_id;
      
      -- Resolve conflicts for videos_agendados
      DELETE FROM public.videos_agendados WHERE avaliacao_id = child_id 
        AND EXISTS (SELECT 1 FROM public.videos_agendados v2 WHERE v2.avaliacao_id = master_id AND v2.dias_apos_avaliacao = public.videos_agendados.dias_apos_avaliacao);
      UPDATE public.videos_agendados SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      
      -- Resolve conflicts for professor_change_requests
      DELETE FROM public.professor_change_requests WHERE avaliacao_id = child_id
        AND EXISTS (SELECT 1 FROM public.professor_change_requests p2 WHERE p2.avaliacao_id = master_id AND p2.professor_id = public.professor_change_requests.professor_id AND p2.status = 'pendente');
      UPDATE public.professor_change_requests SET avaliacao_id = master_id WHERE avaliacao_id = child_id;

      DELETE FROM public.avaliacoes WHERE id = child_id;
    END LOOP;
  END LOOP;

  -- 2. Merge records with NULL evo_id into records with NOT NULL evo_id IF name matches
  FOR child_record IN
    SELECT id, UPPER(btrim(nome_cliente)) as nome
    FROM public.avaliacoes
    WHERE (evo_id IS NULL OR evo_id = '') AND UPPER(btrim(nome_cliente)) <> ''
  LOOP
    -- Find if there is a master record with the same name and a valid evo_id
    SELECT id INTO master_record
    FROM public.avaliacoes
    WHERE UPPER(btrim(nome_cliente)) = child_record.nome
      AND evo_id IS NOT NULL AND evo_id <> ''
      AND id <> child_record.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      -- Redirect dependencies to master_record.id
      UPDATE public.avaliacao_history SET avaliacao_id = master_record.id WHERE avaliacao_id = child_record.id;
      UPDATE public.links_avaliacao SET avaliacao_id = master_record.id WHERE avaliacao_id = child_record.id;
      UPDATE public.avaliacao_acompanhamentos SET avaliacao_id = master_record.id WHERE avaliacao_id = child_record.id;
      UPDATE public.reavaliacoes SET avaliacao_original_id = master_record.id WHERE avaliacao_original_id = child_record.id;
      
      DELETE FROM public.videos_agendados WHERE avaliacao_id = child_record.id 
        AND EXISTS (SELECT 1 FROM public.videos_agendados v2 WHERE v2.avaliacao_id = master_record.id AND v2.dias_apos_avaliacao = public.videos_agendados.dias_apos_avaliacao);
      UPDATE public.videos_agendados SET avaliacao_id = master_record.id WHERE avaliacao_id = child_record.id;
      
      DELETE FROM public.professor_change_requests WHERE avaliacao_id = child_record.id
        AND EXISTS (SELECT 1 FROM public.professor_change_requests p2 WHERE p2.avaliacao_id = master_record.id AND p2.professor_id = public.professor_change_requests.professor_id AND p2.status = 'pendente');
      UPDATE public.professor_change_requests SET avaliacao_id = master_record.id WHERE avaliacao_id = child_record.id;

      DELETE FROM public.avaliacoes WHERE id = child_record.id;
    END IF;
  END LOOP;
  
  -- 3. Merge remaining duplicates where BOTH have NULL evo_id by name
  FOR dup_record IN 
    SELECT UPPER(btrim(nome_cliente)) as nome, array_agg(id ORDER BY created_at DESC) as ids
    FROM public.avaliacoes
    WHERE (evo_id IS NULL OR evo_id = '') AND UPPER(btrim(nome_cliente)) <> ''
    GROUP BY UPPER(btrim(nome_cliente))
    HAVING COUNT(*) > 1
  LOOP
    master_id := dup_record.ids[1];
    arr_len := array_length(dup_record.ids, 1);
    
    FOR i IN 2..arr_len LOOP
      child_id := dup_record.ids[i];
      
      UPDATE public.avaliacao_history SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.links_avaliacao SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.avaliacao_acompanhamentos SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      UPDATE public.reavaliacoes SET avaliacao_original_id = master_id WHERE avaliacao_original_id = child_id;
      
      DELETE FROM public.videos_agendados WHERE avaliacao_id = child_id 
        AND EXISTS (SELECT 1 FROM public.videos_agendados v2 WHERE v2.avaliacao_id = master_id AND v2.dias_apos_avaliacao = public.videos_agendados.dias_apos_avaliacao);
      UPDATE public.videos_agendados SET avaliacao_id = master_id WHERE avaliacao_id = child_id;
      
      DELETE FROM public.professor_change_requests WHERE avaliacao_id = child_id
        AND EXISTS (SELECT 1 FROM public.professor_change_requests p2 WHERE p2.avaliacao_id = master_id AND p2.professor_id = public.professor_change_requests.professor_id AND p2.status = 'pendente');
      UPDATE public.professor_change_requests SET avaliacao_id = master_id WHERE avaliacao_id = child_id;

      DELETE FROM public.avaliacoes WHERE id = child_id;
    END LOOP;
  END LOOP;
END $BODY$;

-- Enforce the strict unique constraint on evo_id safely
DROP INDEX IF EXISTS public.avaliacoes_evo_id_unique;
DROP INDEX IF EXISTS public.idx_avaliacoes_evo_id;

CREATE UNIQUE INDEX avaliacoes_evo_id_unique 
  ON public.avaliacoes (evo_id) 
  WHERE evo_id IS NOT NULL AND evo_id <> '';
