-- Create config table for video automations
CREATE TABLE IF NOT EXISTS public.video_automations_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dias_trigger INTEGER NOT NULL UNIQUE,
    video_url TEXT,
    message_template TEXT DEFAULT 'Olá {{nome}}, tudo bem? Conforme o seu planejamento, aqui está o seu vídeo de hoje: {{link_video}}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for video_automations_config
ALTER TABLE public.video_automations_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coordinators can manage video configs" ON public.video_automations_config;
CREATE POLICY "Coordinators can manage video configs" ON public.video_automations_config
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'coordenador'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'coordenador'));

-- Pre-populate default triggers if not exist
INSERT INTO public.video_automations_config (dias_trigger) 
VALUES (1), (7), (30), (60), (90) 
ON CONFLICT (dias_trigger) DO NOTHING;

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true) 
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects (Videos Bucket)
DROP POLICY IF EXISTS "Public videos access" ON storage.objects;
CREATE POLICY "Public videos access" ON storage.objects 
  FOR SELECT TO public 
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
CREATE POLICY "Authenticated users can update videos" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
CREATE POLICY "Authenticated users can delete videos" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'videos');

-- Allow url_google_drive to be null in videos_agendados as we might use uploaded videos
ALTER TABLE public.videos_agendados ALTER COLUMN url_google_drive DROP NOT NULL;
ALTER TABLE public.videos_agendados ADD COLUMN IF NOT EXISTS error_reason TEXT;
