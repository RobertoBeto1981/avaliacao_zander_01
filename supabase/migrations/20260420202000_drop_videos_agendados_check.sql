DO $$
BEGIN
  -- Permite a criação de gatilhos personalizados para qualquer número de dias
  ALTER TABLE public.videos_agendados DROP CONSTRAINT IF EXISTS videos_agendados_dias_apos_avaliacao_check;
END $$;
