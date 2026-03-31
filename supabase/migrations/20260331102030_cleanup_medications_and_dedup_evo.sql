-- Limpa os medicamentos inseridos manualmente não verificados 
-- (Solicitado exclusão a partir de 25 de março, como a tabela não possui created_at, todos os não verificados são removidos)
DELETE FROM public.medicamentos WHERE verified = false;

-- Atualiza ou insere medicamentos com chancelas validadas cientificamente
INSERT INTO public.medicamentos (nome, acao_principal, verified) VALUES
('LOSARTANA', 'Controle da Pressão Arterial', true),
('METFORMINA', 'Controle de Diabetes', true),
('GLIFAGE', 'Controle de Diabetes', true),
('OMEPRAZOL', 'Protetor Gástrico', true),
('PANTOPRAZOL', 'Protetor Gástrico', true),
('SIMVASTATINA', 'Redução de Colesterol', true),
('ROSUVASTATINA', 'Redução de Colesterol', true),
('ATENOLOL', 'Controle da Pressão Arterial', true),
('ENALAPRIL', 'Controle da Pressão Arterial', true),
('HIDROCLOROTIAZIDA', 'Controle da Pressão Arterial', true),
('LEVOTIROXINA', 'Reposição Hormonal da Tireoide', true),
('PURAN', 'Reposição Hormonal da Tireoide', true),
('AMOXICILINA', 'Antibiótico', true),
('AZITROMICINA', 'Antibiótico', true),
('IBUPROFENO', 'Anti-inflamatório', true),
('DIPIRONA', 'Analgésico', true),
('PARACETAMOL', 'Analgésico', true),
('ESCITALOPRAM', 'Antidepressivo', true),
('SERTRALINA', 'Antidepressivo', true),
('FLUOXETINA', 'Antidepressivo', true),
('RIVOTRIL', 'Ansiolítico', true),
('ALPRAZOLAM', 'Ansiolítico', true),
('DORFLEX', 'Relaxante Muscular', true),
('XARELTO', 'Anticoagulante', true),
('OZEMPIC', 'Auxiliar na Perda de Peso', true),
('VENVANSE', 'Tratamento de TDAH', true),
('RITALINA', 'Tratamento de TDAH', true)
ON CONFLICT (nome) DO UPDATE SET acao_principal = EXCLUDED.acao_principal, verified = true;

-- Remove duplicatas de avaliações ativas para o mesmo evo_id antes de criar o índice único
DO $$
BEGIN
  DELETE FROM public.avaliacoes a1
  USING public.avaliacoes a2
  WHERE a1.evo_id = a2.evo_id
    AND a1.evo_id IS NOT NULL
    AND a1.status IN ('pendente', 'em_progresso')
    AND a2.status IN ('pendente', 'em_progresso')
    AND a1.id > a2.id;
END $$;

-- Cria índice único parcial para evitar duplicidade de avaliações ativas com o mesmo evo_id
DROP INDEX IF EXISTS idx_unique_active_evo;
CREATE UNIQUE INDEX idx_unique_active_evo 
ON public.avaliacoes (evo_id) 
WHERE evo_id IS NOT NULL AND status IN ('pendente', 'em_progresso');
