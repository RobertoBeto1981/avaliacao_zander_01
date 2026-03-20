-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Setup RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to notify professor when an evaluation is assigned to them
CREATE OR REPLACE FUNCTION public.notify_professor_on_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.professor_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.professor_id,
      'Nova Avaliação Atribuída',
      'O cliente ' || NEW.nome_cliente || ' foi atribuído a você para montagem do treino.',
      'system'
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_avaliacao_assigned ON public.avaliacoes;
CREATE TRIGGER on_avaliacao_assigned
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.notify_professor_on_assignment();

-- RPC for bulk messages (used by Coordinator)
CREATE OR REPLACE FUNCTION public.send_bulk_message(p_target_role TEXT, p_title TEXT, p_message TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Verify caller is coordinator
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador') THEN
    RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
  END IF;

  IF p_target_role = 'todos' THEN
    -- Insert for everyone except the sender
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, p_title, p_message, 'message' FROM public.users WHERE id != auth.uid();
  ELSE
    -- Insert for specific role
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, p_title, p_message, 'message' FROM public.users WHERE role::text = p_target_role AND id != auth.uid();
  END IF;
END;
$function$;
