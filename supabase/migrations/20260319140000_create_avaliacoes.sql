CREATE TYPE user_role AS ENUM ('coordenador', 'professor', 'avaliador', 'fisioterapeuta', 'nutricionista');
CREATE TYPE avaliacao_status AS ENUM ('pendente', 'em_progresso', 'concluido');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT
);

CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
    INSERT INTO public.users (id, email, nome, telefone, role)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'telefone',
      (NEW.raw_user_meta_data->>'role')::user_role
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_custom
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_custom();

CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliador_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.users(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  data_avaliacao DATE NOT NULL,
  data_reavaliacao DATE NOT NULL,
  periodo_treino TEXT,
  objectives TEXT[],
  respostas JSONB,
  status avaliacao_status DEFAULT 'concluido',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.links_avaliacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  anamnese_url TEXT,
  mapeamento_sintomas_url TEXT,
  mapeamento_dor_url TEXT,
  bia_url TEXT,
  my_score_url TEXT
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links_avaliacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert themselves" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update themselves" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own avaliacoes" ON public.avaliacoes
  FOR ALL TO authenticated USING (auth.uid() = avaliador_id) WITH CHECK (auth.uid() = avaliador_id);
CREATE POLICY "Coordinators can view all avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  );

CREATE POLICY "Users can manage links of their avaliacoes" ON public.links_avaliacao
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.avaliacoes WHERE id = avaliacao_id AND avaliador_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.avaliacoes WHERE id = avaliacao_id AND avaliador_id = auth.uid())
  );
CREATE POLICY "Coordinators can view all links" ON public.links_avaliacao
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador')
  );
