DO $$
BEGIN
  -- Drop existing policy that restricted viewing bulk_messages to only senders and coordinators
  DROP POLICY IF EXISTS "Users can view bulk messages" ON public.bulk_messages;
  
  -- Create a new comprehensive policy that permits recipients to view the bulk message data (which includes the file_url)
  CREATE POLICY "Users can view bulk messages" ON public.bulk_messages
    FOR SELECT TO authenticated USING (
      (auth.uid() = sender_id) OR
      (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND 'coordenador' = ANY(users.roles))) OR
      (EXISTS (SELECT 1 FROM public.notifications WHERE notifications.bulk_message_id = bulk_messages.id AND notifications.user_id = auth.uid()))
    );
END $$;
