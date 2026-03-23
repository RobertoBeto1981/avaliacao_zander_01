-- Enable necessary extensions for HTTP requests and cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  -- Unschedule if exists to avoid duplicates and ensure idempotency
  PERFORM cron.unschedule('enviar_videos_diario');
EXCEPTION WHEN OTHERS THEN
  -- ignore if the job does not exist yet
END $$;

-- Schedule the job to run daily at 08:00 AM
-- We use pg_net to invoke our Edge Function responsible for sending the videos
SELECT cron.schedule(
  'enviar_videos_diario',
  '0 8 * * *',
  $$
  SELECT net.http_post(
      url:='https://dxfphjzpnspukhdqsktp.supabase.co/functions/v1/enviar_videos_agendados',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZnBoanpwbnNwdWtoZHFza3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjM2MTUsImV4cCI6MjA4OTQ5OTYxNX0.87R7fyTC5HEhxiJ1sNoNxqCDGyJI6C58Jpv4LEVhA1I"}'::jsonb,
      body:='{}'::jsonb
  );
  $$
);
