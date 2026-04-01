-- Recreate send_bulk_message function without 'ativo = true' condition
CREATE OR REPLACE FUNCTION public.send_bulk_message(
    p_target_roles text[], 
    p_title text, 
    p_message text, 
    p_priority text DEFAULT 'normal'::text, 
    p_file_url text DEFAULT NULL::text, 
    p_file_name text DEFAULT NULL::text
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    v_sender_id UUID;
    v_bulk_id UUID;
BEGIN
    v_sender_id := auth.uid();

    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND 'coordenador' = ANY(roles)) THEN
      RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
    END IF;

    INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority, file_url, file_name)
    VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority, p_file_url, p_file_name)
    RETURNING id INTO v_bulk_id;

    IF 'todos' = ANY(p_target_roles) THEN
      INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
      SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
    ELSE
      INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
      SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
      FROM public.users
      WHERE roles && p_target_roles AND id != v_sender_id;
    END IF;
END;
$$;

-- Drop existing policy if it exists to make it idempotent
DROP POLICY IF EXISTS "Coordinators can view all notifications" ON public.notifications;

-- Create policy to allow coordinators to view all notifications (for read receipts)
CREATE POLICY "Coordinators can view all notifications" ON public.notifications
  FOR SELECT TO authenticated 
  USING (EXISTS ( SELECT 1 FROM public.users WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))));
