-- Add new columns for Professor assignment and Profile Management
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS periodo TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS professor_id UUID CONSTRAINT avaliacoes_professor_id_fkey REFERENCES public.users(id);

-- Update handle_new_user_custom to capture 'periodo' from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
    INSERT INTO public.users (id, email, nome, telefone, role, periodo)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      NEW.raw_user_meta_data->>'periodo'
    )
    ON CONFLICT (id) DO UPDATE SET
      periodo = EXCLUDED.periodo;
  END IF;
  RETURN NEW;
END;
$function$;

-- Trigger function to automatically assign professor with least workload
CREATE OR REPLACE FUNCTION public.auto_assign_professor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  selected_prof_id UUID;
BEGIN
  -- Evaluation defaults to 'pendente' once saved by the evaluator
  NEW.status := 'pendente';

  IF NEW.professor_id IS NULL THEN
    -- Find matching period with least workload
    SELECT u.id INTO selected_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE u.role = 'professor' AND u.periodo = NEW.periodo_treino
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

    -- Fallback to any professor if no exact period match
    IF selected_prof_id IS NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE u.role = 'professor'
      GROUP BY u.id
      ORDER BY COUNT(a.id) ASC
      LIMIT 1;
    END IF;

    NEW.professor_id := selected_prof_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Attach trigger to avaliacoes
DROP TRIGGER IF EXISTS on_avaliacao_created_assign_professor ON public.avaliacoes;
CREATE TRIGGER on_avaliacao_created_assign_professor
  BEFORE INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_professor();

-- Update RLS Policies for Professors
DROP POLICY IF EXISTS "Professors can view all avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professors can update avaliacoes status" ON public.avaliacoes;

CREATE POLICY "Professors can view assigned avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor') AND
    professor_id = auth.uid()
  );

CREATE POLICY "Professors can update assigned avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'professor') AND
    professor_id = auth.uid()
  );

-- Storage bucket for profiles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatar uploads
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');
