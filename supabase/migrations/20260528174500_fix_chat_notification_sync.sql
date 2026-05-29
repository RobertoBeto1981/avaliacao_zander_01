-- Re-create function to ensure exact expected text format for synchronization
CREATE OR REPLACE FUNCTION public.notify_internal_chat_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sender_name text;
BEGIN
  -- Pega o nome do remetente
  SELECT nome INTO v_sender_name FROM public.users WHERE id = NEW.sender_id;

  IF NEW.receiver_id IS NOT NULL THEN
    -- Mensagem direta
    INSERT INTO public.notifications (user_id, title, message, type, priority)
    VALUES (
      NEW.receiver_id,
      'Nova mensagem de ' || COALESCE(v_sender_name, 'Usuário'),
      NEW.message,
      'message',
      'normal'
    );
  ELSIF NEW.target_role IS NOT NULL THEN
    -- Mensagem para grupo/role
    IF NEW.target_role = 'todos' THEN
      INSERT INTO public.notifications (user_id, title, message, type, priority)
      SELECT id, 'Nova mensagem no grupo Todos', NEW.message, 'message', 'normal'
      FROM public.users
      WHERE id != NEW.sender_id AND ativo = true;
    ELSE
      INSERT INTO public.notifications (user_id, title, message, type, priority)
      SELECT id, 'Nova mensagem no grupo ' || NEW.target_role, NEW.message, 'message', 'normal'
      FROM public.users
      WHERE (roles && ARRAY[NEW.target_role] OR role::text = NEW.target_role)
        AND id != NEW.sender_id AND ativo = true;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DO $$
BEGIN
  -- Mark direct message notifications as read if there are no unread internal chats from that sender
  UPDATE public.notifications n
  SET is_read = true
  WHERE n.type = 'message'
    AND n.is_read = false
    AND n.title LIKE 'Nova mensagem de %'
    AND NOT EXISTS (
      SELECT 1
      FROM public.internal_chats ic
      JOIN public.users u ON u.id = ic.sender_id
      WHERE ic.receiver_id = n.user_id
        AND ic.is_read = false
        AND n.title ILIKE ('Nova mensagem de ' || u.nome)
    );

  -- Mark group message notifications as read if there are no unread internal chats in that group
  UPDATE public.notifications n
  SET is_read = true
  WHERE n.type = 'message'
    AND n.is_read = false
    AND n.title LIKE 'Nova mensagem no grupo %'
    AND NOT EXISTS (
      SELECT 1
      FROM public.internal_chats ic
      WHERE ic.is_read = false
        AND ic.target_role IS NOT NULL
        AND ic.sender_id != n.user_id
        AND (
          (n.title = 'Nova mensagem no grupo Todos' AND ic.target_role = 'todos')
          OR (n.title ILIKE ('Nova mensagem no grupo ' || ic.target_role))
        )
    );
END $$;
