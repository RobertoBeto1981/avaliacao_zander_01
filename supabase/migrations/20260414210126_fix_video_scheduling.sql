-- Create unique constraint to prevent duplicate scheduling
CREATE UNIQUE INDEX IF NOT EXISTS videos_agendados_avaliacao_dias_key 
ON public.videos_agendados (avaliacao_id, dias_apos_avaliacao);

-- Create or replace the function to schedule videos automatically
CREATE OR REPLACE FUNCTION public.schedule_videos_for_avaliacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into videos_agendados for each active config
  -- Avoid duplicates by checking if it already exists
  INSERT INTO public.videos_agendados (avaliacao_id, dias_apos_avaliacao, status)
  SELECT NEW.id, dias_trigger, 'pendente'
  FROM public.video_automations_config
  WHERE is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.videos_agendados 
      WHERE avaliacao_id = NEW.id AND dias_apos_avaliacao = public.video_automations_config.dias_trigger
    );
  
  RETURN NEW;
END;
$function$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_avaliacao_created_schedule_videos ON public.avaliacoes;
CREATE TRIGGER on_avaliacao_created_schedule_videos
  AFTER INSERT OR UPDATE OF status, data_avaliacao ON public.avaliacoes
  FOR EACH ROW 
  WHEN (NEW.data_avaliacao IS NOT NULL)
  EXECUTE FUNCTION public.schedule_videos_for_avaliacao();

-- Backfill missing video schedules for all existing evaluations that have a date
DO $function$
BEGIN
  INSERT INTO public.videos_agendados (avaliacao_id, dias_apos_avaliacao, status)
  SELECT a.id, c.dias_trigger, 'pendente'
  FROM public.avaliacoes a
  CROSS JOIN public.video_automations_config c
  WHERE a.data_avaliacao IS NOT NULL
    AND c.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.videos_agendados v
      WHERE v.avaliacao_id = a.id AND v.dias_apos_avaliacao = c.dias_trigger
    );
END $function$;
