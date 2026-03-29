CREATE TABLE IF NOT EXISTS public.message_templates (
  id text PRIMARY KEY,
  title text NOT NULL,
  template text NOT NULL,
  variables text NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_templates" ON public.message_templates;
CREATE POLICY "authenticated_select_templates" ON public.message_templates
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "coordenador_update_templates" ON public.message_templates;
CREATE POLICY "coordenador_update_templates" ON public.message_templates
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles))
  ) WITH CHECK (true);

DROP POLICY IF EXISTS "coordenador_insert_templates" ON public.message_templates;
CREATE POLICY "coordenador_insert_templates" ON public.message_templates
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles))
  );

INSERT INTO public.message_templates (id, title, template, variables) VALUES
('links_avaliacao', 'Links da Avaliação (WhatsApp Manual/API)', 'Olá, {{nome}}, tudo bem?

Abaixo estão os links da sua avaliação:

{{links}}

Muito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! 💙', '{{nome}}, {{links}}'),
('desafio_zander', 'Desafio Zander Aceito', 'Fala, {{nome}}! 🚀 Você acaba de aceitar o #DesafioZander! Parabéns pela decisão. O foco agora é total na sua evolução: nosso time entrará em contato em breve para alinharmos os detalhes e garantirmos que você chegue na sua reavaliação daqui a 30 dias com resultados incríveis. Vamos pra cima! 💪', '{{nome}}')
ON CONFLICT (id) DO NOTHING;
