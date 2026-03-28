-- Function to automatically set desafio_zander_ativado_em when status becomes ativo
CREATE OR REPLACE FUNCTION public.set_desafio_zander_activation_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.desafio_zander_status = 'ativo' AND OLD.desafio_zander_status != 'ativo' THEN
        NEW.desafio_zander_ativado_em = NOW();
    END IF;
    RETURN NEW;
END;
$function$;

-- Trigger for avaliacoes
DROP TRIGGER IF EXISTS on_desafio_zander_set_date ON public.avaliacoes;
CREATE TRIGGER on_desafio_zander_set_date
BEFORE UPDATE OF desafio_zander_status ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.set_desafio_zander_activation_date();

-- Update existing records that have 'ativo' but no date
UPDATE public.avaliacoes
SET desafio_zander_ativado_em = created_at
WHERE desafio_zander_status = 'ativo' AND desafio_zander_ativado_em IS NULL;
