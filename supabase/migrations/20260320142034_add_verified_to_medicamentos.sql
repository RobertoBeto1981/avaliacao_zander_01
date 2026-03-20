ALTER TABLE public.medicamentos ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

UPDATE public.medicamentos SET verified = true;
