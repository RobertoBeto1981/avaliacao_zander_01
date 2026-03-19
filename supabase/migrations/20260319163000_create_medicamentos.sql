CREATE TABLE public.medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  acao_principal TEXT NOT NULL
);

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON public.medicamentos
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.medicamentos (nome, acao_principal) VALUES
  ('LOZARTAN', 'Controle da Pressão Arterial'),
  ('METFORMINA', 'Controle do Diabetes'),
  ('SIMVASTATINA', 'Controle de Colesterol'),
  ('OMEPRAZOL', 'Protetor Gástrico'),
  ('ATENOLOL', 'Controle da Pressão Arterial')
ON CONFLICT (nome) DO NOTHING;
