DO $$
BEGIN
  -- Update existing users to uppercase
  UPDATE public.users SET nome = UPPER(nome) WHERE nome != UPPER(nome);
  
  -- Update existing avaliacoes to uppercase
  UPDATE public.avaliacoes SET nome_cliente = UPPER(nome_cliente) WHERE nome_cliente != UPPER(nome_cliente);
  
  -- Update existing evaluations to uppercase
  UPDATE public.evaluations SET client_name = UPPER(client_name) WHERE client_name != UPPER(client_name);
END $$;

CREATE OR REPLACE FUNCTION public.force_uppercase_names()
RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' THEN
    IF NEW.nome IS NOT NULL THEN
      NEW.nome := UPPER(NEW.nome);
    END IF;
  ELSIF TG_TABLE_NAME = 'avaliacoes' THEN
    IF NEW.nome_cliente IS NOT NULL THEN
      NEW.nome_cliente := UPPER(NEW.nome_cliente);
    END IF;
  ELSIF TG_TABLE_NAME = 'evaluations' THEN
    IF NEW.client_name IS NOT NULL THEN
      NEW.client_name := UPPER(NEW.client_name);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS force_uppercase_users ON public.users;
CREATE TRIGGER force_uppercase_users
  BEFORE INSERT OR UPDATE OF nome ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.force_uppercase_names();

DROP TRIGGER IF EXISTS force_uppercase_avaliacoes ON public.avaliacoes;
CREATE TRIGGER force_uppercase_avaliacoes
  BEFORE INSERT OR UPDATE OF nome_cliente ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.force_uppercase_names();

DROP TRIGGER IF EXISTS force_uppercase_evaluations ON public.evaluations;
CREATE TRIGGER force_uppercase_evaluations
  BEFORE INSERT OR UPDATE OF client_name ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.force_uppercase_names();
