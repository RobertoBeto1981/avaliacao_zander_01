CREATE TABLE IF NOT EXISTS public.avaliacao_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacao_history_avaliacao_id ON public.avaliacao_history(avaliacao_id);

ALTER TABLE public.avaliacao_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.avaliacao_history;
CREATE POLICY "Allow select for authenticated" ON public.avaliacao_history
  FOR SELECT TO authenticated USING (true);

-- Function to log avaliacao updates (status and assignment)
CREATE OR REPLACE FUNCTION public.log_avaliacao_updates()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
    VALUES (
      NEW.id,
      current_user_id,
      'STATUS_CHANGE',
      'Status alterado de ' || COALESCE(OLD.status::text, 'nenhum') || ' para ' || COALESCE(NEW.status::text, 'nenhum'),
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  IF OLD.professor_id IS DISTINCT FROM NEW.professor_id AND NEW.professor_id IS NOT NULL THEN
     INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
     VALUES (
       NEW.id,
       current_user_id,
       'PROFESSOR_ASSIGNED',
       'Professor atribuído para acompanhamento de treino',
       jsonb_build_object('old_professor', OLD.professor_id, 'new_professor', NEW.professor_id)
     );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_avaliacao_update_log ON public.avaliacoes;
CREATE TRIGGER on_avaliacao_update_log
  AFTER UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_avaliacao_updates();

-- Function to log acompanhamento changes
CREATE OR REPLACE FUNCTION public.log_acompanhamento_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
    VALUES (
      NEW.avaliacao_id,
      current_user_id,
      'ACOMPANHAMENTO_ADDED',
      'Nova observação ou tarefa adicionada',
      jsonb_build_object('acompanhamento_id', NEW.id, 'prazo', NEW.prazo)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.concluido IS DISTINCT FROM NEW.concluido THEN
      INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
      VALUES (
        NEW.avaliacao_id,
        current_user_id,
        'ACOMPANHAMENTO_TOGGLED',
        CASE WHEN NEW.concluido THEN 'Tarefa marcada como concluída' ELSE 'Tarefa reaberta' END,
        jsonb_build_object('acompanhamento_id', NEW.id, 'concluido', NEW.concluido)
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_acompanhamento_change_log ON public.avaliacao_acompanhamentos;
CREATE TRIGGER on_acompanhamento_change_log
  AFTER INSERT OR UPDATE ON public.avaliacao_acompanhamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.log_acompanhamento_changes();
