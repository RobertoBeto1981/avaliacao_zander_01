DO $$
BEGIN
  -- Trigger and function creation to automatically clean up video scheduling history older than 30 days
END $$;

CREATE OR REPLACE FUNCTION public.cleanup_old_video_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apaga envios de videos agendados com mais de 30 dias (sucesso ou erro)
  DELETE FROM public.videos_agendados
  WHERE data_envio < NOW() - INTERVAL '30 days';
  
  RETURN NULL;
END;
$;

DROP TRIGGER IF EXISTS trg_cleanup_old_video_history ON public.videos_agendados;
CREATE TRIGGER trg_cleanup_old_video_history
AFTER INSERT OR UPDATE ON public.videos_agendados
FOR EACH STATEMENT EXECUTE FUNCTION public.cleanup_old_video_history();
