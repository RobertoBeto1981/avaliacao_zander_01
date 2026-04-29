-- Function and trigger to notify responsible professor when an acompanhamento is added
-- The notification should NOT be sent if the autor is the professor themselves.

CREATE OR REPLACE FUNCTION public.notify_professor_on_acompanhamento()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_professor_id UUID;
  v_nome_cliente TEXT;
  v_autor_nome TEXT;
BEGIN
  -- Obter o professor_id e nome_cliente da avaliacao vinculada ao acompanhamento
  SELECT professor_id, nome_cliente INTO v_professor_id, v_nome_cliente
  FROM public.avaliacoes
  WHERE id = NEW.avaliacao_id;

  -- Verifica se existe um professor responsável e se o autor do acompanhamento é diferente do professor responsável
  IF v_professor_id IS NOT NULL AND v_professor_id != NEW.autor_id THEN
    
    -- Obter o nome do autor que fez o acompanhamento
    SELECT nome INTO v_autor_nome FROM public.users WHERE id = NEW.autor_id;
    
    -- Inserir notificação para o professor
    INSERT INTO public.notifications (user_id, title, message, type, priority)
    VALUES (
      v_professor_id,
      'Nova Anotação - ' || v_nome_cliente,
      COALESCE(v_autor_nome, 'Alguém') || ' adicionou uma nova observação: ' || 
      CASE WHEN LENGTH(NEW.observacao) > 100 
           THEN SUBSTRING(NEW.observacao FROM 1 FOR 100) || '...' 
           ELSE NEW.observacao 
      END,
      'system',
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_acompanhamento_added_notify ON public.avaliacao_acompanhamentos;
CREATE TRIGGER on_acompanhamento_added_notify
  AFTER INSERT ON public.avaliacao_acompanhamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_professor_on_acompanhamento();
