-- Adiciona log de histórico na criação de novos clientes/avaliações
DO $$
BEGIN
  CREATE OR REPLACE FUNCTION public.log_new_client_history()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  DECLARE
    v_role text;
    v_nome text;
    v_first_name text;
    current_user_id UUID := auth.uid();
  BEGIN
    IF current_user_id IS NOT NULL THEN
      SELECT role::text, nome INTO v_role, v_nome
      FROM public.users
      WHERE id = current_user_id;

      v_first_name := split_part(v_nome, ' ', 1);

      INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
      VALUES (
        NEW.id,
        current_user_id,
        'CREATED',
        'Cliente adicionado pelo ' || COALESCE(v_role, 'sistema') || ' ' || COALESCE(v_first_name, ''),
        jsonb_build_object('is_pre_avaliacao', NEW.is_pre_avaliacao)
      );
    ELSE
      INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
      VALUES (
        NEW.id,
        NULL,
        'CREATED',
        'Cliente adicionado pelo sistema',
        jsonb_build_object('is_pre_avaliacao', NEW.is_pre_avaliacao)
      );
    END IF;
    RETURN NEW;
  END;
  $func$;

  DROP TRIGGER IF EXISTS on_avaliacao_created_log ON public.avaliacoes;
  CREATE TRIGGER on_avaliacao_created_log
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_new_client_history();
END $$;
