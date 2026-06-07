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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Personal Beto", "role": "coordenador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.mark_chat_messages_as_read(
  p_contact_id text,
  p_contact_type text,
  p_user_id uuid,
  p_contact_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_title_match text;
BEGIN
  -- 1. Update internal_chats
  IF p_contact_type = 'group' THEN
    UPDATE public.internal_chats
    SET is_read = true
    WHERE target_role = p_contact_id
      AND is_read = false
      AND sender_id != p_user_id;
  ELSE
    UPDATE public.internal_chats
    SET is_read = true
    WHERE sender_id = p_contact_id::uuid
      AND receiver_id = p_user_id
      AND is_read = false;
  END IF;

  -- 2. Update notifications
  IF p_contact_name IS NOT NULL THEN
    IF p_contact_type = 'group' THEN
      IF p_contact_id = 'todos' THEN
        v_title_match := 'Nova mensagem no grupo Todos';
      ELSE
        v_title_match := 'Nova mensagem no grupo ' || p_contact_id;
      END IF;
    ELSE
      v_title_match := 'Nova mensagem de ' || p_contact_name;
    END IF;

    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = p_user_id
      AND is_read = false
      AND type = 'message'
      AND title ILIKE v_title_match;
  END IF;
END;
$$;
