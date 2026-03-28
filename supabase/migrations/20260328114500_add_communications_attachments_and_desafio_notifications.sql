-- Add columns for attachments
ALTER TABLE public.bulk_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.bulk_messages ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Storage Bucket for communications
DO $do$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('communications', 'communications', true)
  ON CONFLICT (id) DO NOTHING;
END $do$;

-- Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'communications');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'communications');

-- Recreate send_bulk_message RPC to include attachments
DROP FUNCTION IF EXISTS public.send_bulk_message(text[], text, text, text);

CREATE OR REPLACE FUNCTION public.send_bulk_message(
    p_target_roles text[],
    p_title text,
    p_message text,
    p_priority text DEFAULT 'normal'::text,
    p_file_url text DEFAULT NULL,
    p_file_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_sender_id UUID;
    v_bulk_id UUID;
BEGIN
    v_sender_id := auth.uid();

    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND 'coordenador' = ANY(roles)) THEN
      RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
    END IF;

    INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority, file_url, file_name)
    VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority, p_file_url, p_file_name)
    RETURNING id INTO v_bulk_id;

    IF 'todos' = ANY(p_target_roles) THEN
      INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
      SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id AND ativo = true;
    ELSE
      INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
      SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
      FROM public.users
      WHERE roles && p_target_roles AND id != v_sender_id AND ativo = true;
    END IF;
END;
$function$;

-- Create trigger to notify professor when a client is marked as #DesafioZander
CREATE OR REPLACE FUNCTION public.notify_desafio_zander_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.desafio_zander_status = 'ativo' AND OLD.desafio_zander_status != 'ativo' AND NEW.professor_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.professor_id,
            'Novo Aluno #DesafioZander',
            'O cliente ' || NEW.nome_cliente || ' foi marcado como participante do #DesafioZander. Por favor, priorize a montagem do treino.',
            'system'
        );
    END IF;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_desafio_zander_activated ON public.avaliacoes;
CREATE TRIGGER on_desafio_zander_activated
AFTER UPDATE OF desafio_zander_status ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.notify_desafio_zander_activation();

-- Retroactive notification for professors who received DesafioZander clients recently
DO $do$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT 
        professor_id,
        'Aviso Retroativo: #DesafioZander',
        'O cliente ' || nome_cliente || ' é um participante do #DesafioZander. Por favor, verifique o seu painel de avaliações.',
        'system'
    FROM public.avaliacoes
    WHERE desafio_zander_status = 'ativo'
      AND professor_id IS NOT NULL
      AND (
          desafio_zander_ativado_em >= CURRENT_DATE - INTERVAL '3 days'
          OR created_at >= CURRENT_DATE - INTERVAL '3 days'
      )
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors to not block the migration execution
END;
$do$;
