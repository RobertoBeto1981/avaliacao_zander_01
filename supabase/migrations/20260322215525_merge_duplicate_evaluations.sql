DO $$ 
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN 
    SELECT pre.id as pre_id, pre.professor_id, real_eval.id as real_id
    FROM public.avaliacoes pre
    JOIN public.avaliacoes real_eval ON pre.evo_id = real_eval.evo_id
    WHERE pre.is_pre_avaliacao = true 
      AND real_eval.is_pre_avaliacao = false
  LOOP
    -- Atualiza a avaliação real com o professor_id se ele estiver faltando
    IF dup.professor_id IS NOT NULL THEN
      UPDATE public.avaliacoes 
      SET professor_id = dup.professor_id
      WHERE id = dup.real_id AND professor_id IS NULL;
    END IF;
    
    -- Deleta a pré-avaliação para corrigir a duplicação
    DELETE FROM public.avaliacoes WHERE id = dup.pre_id;
  END LOOP;
END $$;
