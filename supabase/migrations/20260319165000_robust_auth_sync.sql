-- Update the existing trigger function to guarantee a profile is always created,
-- adding fallbacks for missing metadata to prevent data inconsistency.
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, telefone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário ' || split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'telefone',
    COALESCE((NEW.raw_user_meta_data->>'role'), 'avaliador')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is correctly associated with auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_custom();

-- Retroactively create missing public.users records for any existing auth.users
-- to prevent runtime errors for older accounts that failed to sync.
INSERT INTO public.users (id, email, nome, telefone, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'nome', 'Usuário ' || split_part(email, '@', 1)),
  raw_user_meta_data->>'telefone',
  COALESCE((raw_user_meta_data->>'role'), 'avaliador')::public.user_role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
