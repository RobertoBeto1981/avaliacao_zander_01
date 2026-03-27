DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'desafio_zander_ativado_em'
  ) THEN
    ALTER TABLE public.avaliacoes ADD COLUMN desafio_zander_ativado_em TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'avaliacoes' AND column_name = 'desafio_zander_enviado_em'
  ) THEN
    ALTER TABLE public.avaliacoes ADD COLUMN desafio_zander_enviado_em TIMESTAMPTZ;
  END IF;
END $$;
