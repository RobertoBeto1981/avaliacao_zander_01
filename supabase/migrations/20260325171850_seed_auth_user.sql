DO $BODY$
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
      crypt('TESTE1234', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Personal Beto"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, nome, role, roles)
    VALUES (new_user_id, 'personalbeto@hotmail.com', 'Personal Beto', 'coordenador', ARRAY['coordenador', 'professor', 'avaliador'])
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('TESTE1234', gen_salt('bf'))
    WHERE email = 'personalbeto@hotmail.com';
  END IF;
END $BODY$;
