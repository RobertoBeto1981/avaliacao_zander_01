DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('student-documents', 'student-documents', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

ALTER TABLE public.avaliacao_acompanhamentos ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.avaliacao_acompanhamentos ADD COLUMN IF NOT EXISTS file_name TEXT;

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student-documents');

DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow authenticated reads" ON storage.objects 
  FOR SELECT TO authenticated USING (bucket_id = 'student-documents');
