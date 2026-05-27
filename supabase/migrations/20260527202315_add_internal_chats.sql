CREATE TABLE IF NOT EXISTS public.internal_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_role TEXT,
    message TEXT NOT NULL,
    avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.internal_chats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can select their chats" ON public.internal_chats;
    CREATE POLICY "Users can select their chats" ON public.internal_chats
    FOR SELECT TO authenticated
    USING (
      sender_id = auth.uid() OR
      receiver_id = auth.uid() OR
      (target_role IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (target_role = ANY(u.roles) OR u.role::text = target_role OR target_role = 'todos')
      ))
    );

    DROP POLICY IF EXISTS "Users can insert chats" ON public.internal_chats;
    CREATE POLICY "Users can insert chats" ON public.internal_chats
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

    DROP POLICY IF EXISTS "Users can update their chats" ON public.internal_chats;
    CREATE POLICY "Users can update their chats" ON public.internal_chats
    FOR UPDATE TO authenticated
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());
END $$;

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
      '{"nome": "Coordenador Beto"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, nome, role, roles, ativo)
    VALUES (new_user_id, 'personalbeto@hotmail.com', 'Coordenador Beto', 'coordenador', ARRAY['coordenador'], true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
