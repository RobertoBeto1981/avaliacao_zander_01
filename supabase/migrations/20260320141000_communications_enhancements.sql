-- Create bulk messages table to track sent messages and their read status
CREATE TABLE IF NOT EXISTS public.bulk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Setup RLS for bulk_messages
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coordinators can view all bulk messages" ON public.bulk_messages;
CREATE POLICY "Coordinators can view all bulk messages" ON public.bulk_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  );

DROP POLICY IF EXISTS "Coordinators can insert bulk messages" ON public.bulk_messages;
CREATE POLICY "Coordinators can insert bulk messages" ON public.bulk_messages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  );

-- Add new columns to notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS bulk_message_id UUID REFERENCES public.bulk_messages(id) ON DELETE CASCADE;

-- Drop old function
DROP FUNCTION IF EXISTS public.send_bulk_message(TEXT, TEXT, TEXT);

-- Create new function with priority and tracking
CREATE OR REPLACE FUNCTION public.send_bulk_message(
  p_target_role TEXT,
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

  -- Insert into bulk_messages
  INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority)
  VALUES (v_sender_id, p_target_role, p_title, p_message, p_priority)
  RETURNING id INTO v_bulk_id;

  IF p_target_role = 'todos' THEN
    -- Insert for everyone except the sender
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
  ELSE
    -- Insert for specific role
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE role::text = p_target_role AND id != v_sender_id;
  END IF;
END;
$function$;
