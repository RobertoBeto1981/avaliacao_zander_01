DO $$
BEGIN
  ALTER TABLE public.bulk_messages 
  ADD COLUMN IF NOT EXISTS hidden_from_library BOOLEAN NOT NULL DEFAULT false;
END $$;
