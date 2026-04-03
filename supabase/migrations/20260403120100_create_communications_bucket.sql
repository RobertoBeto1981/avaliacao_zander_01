-- Setup bucket for internal communications file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('communications', 'communications', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "communications_public_select" ON storage.objects;
CREATE POLICY "communications_public_select" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'communications');

DROP POLICY IF EXISTS "communications_auth_insert" ON storage.objects;
CREATE POLICY "communications_auth_insert" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'communications');
