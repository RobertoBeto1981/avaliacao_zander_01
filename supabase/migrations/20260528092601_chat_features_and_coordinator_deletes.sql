-- 1. Add file_url and file_name to internal_chats
ALTER TABLE public.internal_chats ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.internal_chats ADD COLUMN IF NOT EXISTS file_name TEXT;

-- 2. Update RLS for internal_chats UPDATE to allow marking as read for group chats
DROP POLICY IF EXISTS "Users can update their chats" ON public.internal_chats;
CREATE POLICY "Users can update their chats" ON public.internal_chats
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid() 
    OR (target_role IS NOT NULL AND EXISTS ( SELECT 1 FROM users u WHERE u.id = auth.uid() AND (internal_chats.target_role = ANY (u.roles) OR (u.role)::text = internal_chats.target_role OR internal_chats.target_role = 'todos')))
  );

-- 3. Update RLS for avaliacao_acompanhamentos to allow DELETE for coordinators
DROP POLICY IF EXISTS "Coordinators can delete acompanhamentos" ON public.avaliacao_acompanhamentos;
CREATE POLICY "Coordinators can delete acompanhamentos" ON public.avaliacao_acompanhamentos
  FOR DELETE TO authenticated
  USING (EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND 'coordenador' = ANY (users.roles) ));

-- 4. Create chat-attachments bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false) ON CONFLICT (id) DO NOTHING;

-- RLS for chat-attachments bucket
DROP POLICY IF EXISTS "Authenticated users can insert chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can insert chat attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated users can select chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can select chat attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated users can delete chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can delete chat attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-attachments');

-- 5. Seed personalbeto@hotmail.com as coordinator
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'personalbeto@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'personalbeto@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Personal Beto", "role": "coordenador", "roles": ["coordenador"]}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.users (id, email, nome, role, roles, ativo)
    VALUES (new_user_id, 'personalbeto@hotmail.com', 'Personal Beto', 'coordenador', ARRAY['coordenador'], true)
    ON CONFLICT (id) DO UPDATE SET roles = ARRAY['coordenador'], role = 'coordenador';
  ELSE
    -- User exists, ensure coordinator role is present in users table
    UPDATE public.users 
    SET roles = CASE 
                  WHEN NOT ('coordenador' = ANY(roles)) THEN array_append(roles, 'coordenador') 
                  ELSE roles 
                END, 
        role = 'coordenador' 
    WHERE email = 'personalbeto@hotmail.com';
  END IF;
END $$;
