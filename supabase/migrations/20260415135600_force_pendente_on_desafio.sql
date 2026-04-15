CREATE OR REPLACE FUNCTION public.set_desafio_zander_activation_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.desafio_zander_status = 'ativo' AND OLD.desafio_zander_status != 'ativo' THEN
        NEW.desafio_zander_ativado_em = NOW();
        -- Força o status para pendente para garantir que o professor tenha que concluir novamente o treino
        NEW.status = 'pendente';
    END IF;
    RETURN NEW;
END;
$function$;
