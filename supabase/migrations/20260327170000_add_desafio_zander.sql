DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'desafio_zander_status'
  ) THEN
    ALTER TABLE public.avaliacoes ADD COLUMN desafio_zander_status text NOT NULL DEFAULT 'nenhum';
  END IF;
END $$;
