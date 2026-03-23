DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'personalbeto@hotmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'personalbeto@hotmail.com',
      crypt('ZanderAdmin123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Beto", "role": "coordenador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.users (id, email, nome, role)
    VALUES (v_user_id, 'personalbeto@hotmail.com', 'Beto', 'coordenador')
    ON CONFLICT (id) DO UPDATE SET role = 'coordenador';
  ELSE
    -- Se já existe, apenas promove a coordenador
    UPDATE public.users 
    SET role = 'coordenador' 
    WHERE email = 'personalbeto@hotmail.com';
    
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"coordenador"')
    WHERE email = 'personalbeto@hotmail.com';
  END IF;
END $$;
