-- Add periodos array to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS periodos text[] DEFAULT '{}'::text[];

-- Update existing users to have periodos populated from old periodo column
UPDATE public.users SET periodos = ARRAY[periodo] WHERE periodo IS NOT NULL AND periodos = '{}'::text[];

-- Drop existing trigger before redefining
DROP TRIGGER IF EXISTS on_avaliacao_created_assign_professor ON public.avaliacoes;

-- Update the trigger function
CREATE OR REPLACE FUNCTION public.auto_assign_professor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  selected_prof_id UUID;
BEGIN
  -- Só distribui se for uma avaliação real (não pré-avaliação) e se não tiver professor
  IF NEW.is_pre_avaliacao = false AND NEW.professor_id IS NULL AND NEW.periodo_treino IS NOT NULL THEN
    -- Tenta encontrar um professor que tenha o período correspondente nos seus periodos
    SELECT u.id INTO selected_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE 'professor' = ANY(u.roles) AND NEW.periodo_treino = ANY(u.periodos)
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

    -- Se não encontrar por período, pega qualquer professor com menos avaliações
    IF selected_prof_id IS NULL THEN
      SELECT u.id INTO selected_prof_id
      FROM public.users u
      LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
      WHERE 'professor' = ANY(u.roles)
      GROUP BY u.id
      ORDER BY COUNT(a.id) ASC
      LIMIT 1;
    END IF;

    NEW.professor_id := selected_prof_id;
  END IF;

  -- Define status inicial se estiver nulo e não for pré-avaliação
  IF NEW.status IS NULL AND NEW.is_pre_avaliacao = false THEN
    NEW.status := 'pendente';
  END IF;

  RETURN NEW;
END;
$function$;

-- Recreate trigger for BEFORE INSERT OR UPDATE
CREATE TRIGGER on_avaliacao_created_assign_professor
BEFORE INSERT OR UPDATE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_professor();

-- Update handle_new_user_custom to read periodos from meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_roles text[];
  v_periodos text[];
BEGIN
  IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
    
    -- Trata o array de roles do metadado JSON
    IF NEW.raw_user_meta_data->'roles' IS NOT NULL AND jsonb_array_length(NEW.raw_user_meta_data->'roles') > 0 THEN
      SELECT array_agg(x::text) INTO v_roles FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') x;
    ELSIF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
      v_roles := ARRAY[NEW.raw_user_meta_data->>'role'];
    ELSE
      v_roles := ARRAY['professor'];
    END IF;

    -- Trata o array de periodos
    IF NEW.raw_user_meta_data->'periodos' IS NOT NULL AND jsonb_array_length(NEW.raw_user_meta_data->'periodos') > 0 THEN
      SELECT array_agg(x::text) INTO v_periodos FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'periodos') x;
    ELSE
      v_periodos := '{}'::text[];
    END IF;

    INSERT INTO public.users (id, email, nome, telefone, role, roles, periodo, periodos)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (v_roles[1])::public.user_role,
      v_roles,
      NEW.raw_user_meta_data->>'periodo',
      v_periodos
    )
    ON CONFLICT (id) DO UPDATE SET
      periodo = EXCLUDED.periodo,
      periodos = EXCLUDED.periodos,
      roles = EXCLUDED.roles,
      nome = EXCLUDED.nome,
      telefone = EXCLUDED.telefone;
  END IF;
  RETURN NEW;
END;
$function$;
