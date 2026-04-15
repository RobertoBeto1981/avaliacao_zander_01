-- Fix send_internal_communication to support users where 'roles' array is empty but 'role' enum is correct
CREATE OR REPLACE FUNCTION public.send_internal_communication(p_target_roles text[], p_target_users uuid[], p_title text, p_message text, p_priority text DEFAULT 'normal'::text, p_file_url text DEFAULT NULL::text, p_file_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_sender_id UUID;
    v_bulk_id UUID;
    v_role_text text;
BEGIN
    v_sender_id := auth.uid();

    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND ativo = true) THEN
      RAISE EXCEPTION 'Apenas usuários ativos podem enviar comunicados.';
    END IF;

    v_role_text := array_to_string(p_target_roles, ', ');
    IF array_length(p_target_users, 1) > 0 THEN
      IF v_role_text = '' THEN
        v_role_text := 'usuarios_especificos';
      ELSE
        v_role_text := v_role_text || ', usuarios_especificos';
      END IF;
    END IF;

    INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority, file_url, file_name)
    VALUES (v_sender_id, COALESCE(NULLIF(v_role_text, ''), 'nenhum'), p_title, p_message, p_priority, p_file_url, p_file_name)
    RETURNING id INTO v_bulk_id;

    -- Insert for roles
    IF array_length(p_target_roles, 1) > 0 THEN
      IF 'todos' = ANY(p_target_roles) THEN
        INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
        SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id 
        FROM public.users 
        WHERE id != v_sender_id AND ativo = true;
      ELSE
        INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
        SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
        FROM public.users
        WHERE (roles && p_target_roles OR role::text = ANY(p_target_roles))
          AND id != v_sender_id AND ativo = true;
      END IF;
    END IF;

    -- Insert for specific users
    IF array_length(p_target_users, 1) > 0 THEN
      INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
      SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
      FROM public.users
      WHERE id = ANY(p_target_users) AND id != v_sender_id AND ativo = true
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.user_id = public.users.id AND n.bulk_message_id = v_bulk_id
      );
    END IF;
END;
$function$;
