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
      crypt('teste1234', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Beto", "role": "coordenador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, nome, role, roles)
    VALUES (new_user_id, 'personalbeto@hotmail.com', 'Beto', 'coordenador', ARRAY['coordenador']::public.user_role[])
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('teste1234', gen_salt('bf'))
    WHERE email = 'personalbeto@hotmail.com';
    
    INSERT INTO public.users (id, email, nome, role, roles)
    SELECT id, email, COALESCE((raw_user_meta_data->>'nome'), 'Beto'), 'coordenador', ARRAY['coordenador']::public.user_role[]
    FROM auth.users WHERE email = 'personalbeto@hotmail.com'
    ON CONFLICT (id) DO UPDATE SET 
      role = 'coordenador',
      roles = ARRAY['coordenador']::public.user_role[];
  END IF;
END $$;
