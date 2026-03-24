-- Adiciona suporte a multiplos cargos/papeis por usuario
DO $$
BEGIN
  -- 1. Cria a nova coluna de array de cargos
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}'::text[];

  -- 2. Migra os dados da coluna enum antiga (se vazios)
  UPDATE public.users SET roles = ARRAY[role::text] WHERE array_length(roles, 1) IS NULL OR roles = '{}'::text[];

  -- 3. Permite pre-avaliacoes sem avaliador_id atrelado inicialmente
  ALTER TABLE public.avaliacoes ALTER COLUMN avaliador_id DROP NOT NULL;
  ALTER TABLE public.avaliacoes ALTER COLUMN avaliador_id DROP DEFAULT;
END $$;

-- 4. Funcao ajustada para lidar com array de roles e salvar ambos
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS trigger AS $function$
DECLARE
  v_roles text[];
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

    INSERT INTO public.users (id, email, nome, telefone, role, roles, periodo)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (v_roles[1])::public.user_role,
      v_roles,
      NEW.raw_user_meta_data->>'periodo'
    )
    ON CONFLICT (id) DO UPDATE SET
      periodo = EXCLUDED.periodo,
      roles = EXCLUDED.roles,
      nome = EXCLUDED.nome,
      telefone = EXCLUDED.telefone;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Auto associar professor verificando pelo array de roles
CREATE OR REPLACE FUNCTION public.auto_assign_professor()
RETURNS trigger AS $function$
DECLARE
  selected_prof_id UUID;
BEGIN
  NEW.status := 'pendente';

  IF NEW.professor_id IS NULL THEN
    SELECT u.id INTO selected_prof_id
    FROM public.users u
    LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
    WHERE 'professor' = ANY(u.roles) AND u.periodo = NEW.periodo_treino
    GROUP BY u.id
    ORDER BY COUNT(a.id) ASC
    LIMIT 1;

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

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Funcao de exclusao conferindo roles
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS void AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)) THEN
    RAISE EXCEPTION 'Apenas coordenadores podem excluir usuários do sistema.';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Disparo de notificacoes em massa usando roles
CREATE OR REPLACE FUNCTION public.send_bulk_message(p_target_roles text[], p_title text, p_message text, p_priority text DEFAULT 'normal'::text)
RETURNS void AS $function$
DECLARE
  v_sender_id UUID;
  v_bulk_id UUID;
BEGIN
  v_sender_id := auth.uid();

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND 'coordenador' = ANY(roles)) THEN
    RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
  END IF;

  INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority)
  VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority)
  RETURNING id INTO v_bulk_id;

  IF 'todos' = ANY(p_target_roles) THEN
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
  ELSE
    INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
    SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id 
    FROM public.users 
    WHERE roles && p_target_roles AND id != v_sender_id;
  END IF;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. Recriando politicas RLS atualizadas com 'ANY(roles)' para avaliacoes
DROP POLICY IF EXISTS "Avaliadores can insert avaliacoes" ON public.avaliacoes;
CREATE POLICY "Avaliadores can insert avaliacoes" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'avaliador' = ANY(roles)));

DROP POLICY IF EXISTS "Avaliadores can update avaliacoes" ON public.avaliacoes;
CREATE POLICY "Avaliadores can update avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'avaliador' = ANY(roles)));

DROP POLICY IF EXISTS "Coordinators have full access to avaliacoes" ON public.avaliacoes;
CREATE POLICY "Coordinators have full access to avaliacoes" ON public.avaliacoes
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles))) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

DROP POLICY IF EXISTS "Professors can insert pre-evaluations" ON public.avaliacoes;
CREATE POLICY "Professors can insert pre-evaluations" ON public.avaliacoes
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'professor' = ANY(roles)) AND is_pre_avaliacao = true);

DROP POLICY IF EXISTS "Professors can update assigned avaliacoes" ON public.avaliacoes;
CREATE POLICY "Professors can update assigned avaliacoes" ON public.avaliacoes
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'professor' = ANY(roles)) AND professor_id = auth.uid());

-- Politicas RLS para bulk_messages
DROP POLICY IF EXISTS "Coordinators can insert bulk messages" ON public.bulk_messages;
CREATE POLICY "Coordinators can insert bulk messages" ON public.bulk_messages
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

DROP POLICY IF EXISTS "Coordinators can view all bulk messages" ON public.bulk_messages;
CREATE POLICY "Coordinators can view all bulk messages" ON public.bulk_messages
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

-- Politicas RLS para links_avaliacao
DROP POLICY IF EXISTS "Coordinators can view all links" ON public.links_avaliacao;
CREATE POLICY "Coordinators can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

DROP POLICY IF EXISTS "Fisio and Nutri can view all links" ON public.links_avaliacao;
CREATE POLICY "Fisio and Nutri can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles && ARRAY['fisioterapeuta', 'nutricionista']));

DROP POLICY IF EXISTS "Professors can view all links" ON public.links_avaliacao;
CREATE POLICY "Professors can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'professor' = ANY(roles)));

-- Politicas RLS para users
DROP POLICY IF EXISTS "Coordinators can delete users" ON public.users;
CREATE POLICY "Coordinators can delete users" ON public.users
  FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

DROP POLICY IF EXISTS "Coordinators can insert users" ON public.users;
CREATE POLICY "Coordinators can insert users" ON public.users
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

DROP POLICY IF EXISTS "Coordinators can update users" ON public.users;
CREATE POLICY "Coordinators can update users" ON public.users
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

-- Politicas RLS para video_automations_config
DROP POLICY IF EXISTS "Coordinators can manage video configs" ON public.video_automations_config;
CREATE POLICY "Coordinators can manage video configs" ON public.video_automations_config
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

-- Politicas RLS para videos_agendados
DROP POLICY IF EXISTS "Coordinators can manage scheduled videos" ON public.videos_agendados;
CREATE POLICY "Coordinators can manage scheduled videos" ON public.videos_agendados
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)));

