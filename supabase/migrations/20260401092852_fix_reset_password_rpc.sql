CREATE OR REPLACE FUNCTION public.reset_user_password(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(p_email));
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET 
      encrypted_password = extensions.crypt('teste1234', extensions.gen_salt('bf', 10)),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW(),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = v_user_id;
  ELSE
    RAISE EXCEPTION 'Usuário não encontrado com este e-mail.';
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.reset_user_password(text) TO anon, authenticated;
