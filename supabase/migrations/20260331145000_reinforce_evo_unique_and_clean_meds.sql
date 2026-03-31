-- Higienização da base de medicamentos: remove todos os não verificados, 
-- garantindo a limpeza rigorosa de medicamentos aprendidos manualmente
DELETE FROM public.medicamentos WHERE verified = false;

-- Atualiza nomes para uppercase e padroniza a formatação geral no banco
UPDATE public.medicamentos SET nome = UPPER(nome);

-- Reforça a unicidade do EVO_ID para avaliações ativas
-- Primeiro remove duplicatas residuais caso existam antes de recriar o índice
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

DROP INDEX IF EXISTS idx_unique_active_evo;

CREATE UNIQUE INDEX idx_unique_active_evo 
ON public.avaliacoes (evo_id) 
WHERE evo_id IS NOT NULL AND status IN ('pendente', 'em_progresso');
