-- Enable Realtime for internal_chats to allow instant sync across clients
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_chats;
ALTER TABLE public.internal_chats REPLICA IDENTITY FULL;

-- Indexes to improve performance of queries and real-time filtering
CREATE INDEX IF NOT EXISTS idx_internal_chats_sender_id ON public.internal_chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_chats_receiver_id ON public.internal_chats(receiver_id);
CREATE INDEX IF NOT EXISTS idx_internal_chats_target_role ON public.internal_chats(target_role);
CREATE INDEX IF NOT EXISTS idx_internal_chats_avaliacao_id ON public.internal_chats(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_internal_chats_created_at ON public.internal_chats(created_at DESC);

-- Notification Indexes for better performance on high volume lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_archived ON public.notifications(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Seed Coordenador User for testing administrative capabilities
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'personalbeto@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users (handling GoTrue null bug gracefully)
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
      '{"nome": "Coordenador Beto", "role": "coordenador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,  -- phone must be NULL because of unique constraint
      '', '', ''
    );

    -- Insert into public.users to ensure role mapping exists
    INSERT INTO public.users (id, email, nome, role, roles, ativo)
    VALUES (
      new_user_id, 
      'personalbeto@hotmail.com', 
      'COORDENADOR BETO', 
      'coordenador', 
      ARRAY['coordenador'], 
      true
    )
    ON CONFLICT (id) DO UPDATE SET 
      roles = ARRAY['coordenador'], 
      role = 'coordenador', 
      nome = 'COORDENADOR BETO';
  END IF;
END $$;
