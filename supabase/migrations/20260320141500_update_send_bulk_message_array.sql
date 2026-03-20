-- Drop the old function that accepts a single text for target_role
DROP FUNCTION IF EXISTS public.send_bulk_message(TEXT, TEXT, TEXT, TEXT);

-- Create the new function that accepts an array of roles
CREATE OR REPLACE FUNCTION public.send_bulk_message(
  p_target_roles TEXT[],
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_sender_id UUID;
  v_bulk_id UUID;
BEGIN
  v_sender_id := auth.uid();

  -- Verify caller is coordinator
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND role = 'coordenador') THEN
    RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
  END IF;

  -- Insert into bulk_messages (convert array to comma-separated string for display)
  INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority)
  VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority)
  RETURNING id INTO v_bulk_id;

  IF 'todos' = ANY(p_target_roles) THEN
    -- Insert for everyone except the sender
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
  ELSE
    -- Insert for specific roles
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id 
    FROM public.users 
    WHERE role::text = ANY(p_target_roles) AND id != v_sender_id;
  END IF;
END;
$function$;
