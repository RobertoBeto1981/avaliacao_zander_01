-- 1. Permissão para coordenador deletar mensagens do chat
DROP POLICY IF EXISTS "Coordenador can delete chats" ON public.internal_chats;
CREATE POLICY "Coordenador can delete chats" ON public.internal_chats
FOR DELETE TO authenticated
USING (
  EXISTS ( 
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
      AND ('coordenador'::text = ANY(users.roles) OR users.role = 'coordenador')
  )
);

-- 2. Trigger para notificações automáticas de mensagens do chat
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

DROP TRIGGER IF EXISTS on_internal_chat_message ON public.internal_chats;
CREATE TRIGGER on_internal_chat_message
  AFTER INSERT ON public.internal_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_internal_chat_message();
