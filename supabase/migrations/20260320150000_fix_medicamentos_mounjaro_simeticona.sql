-- Corrige medicamentos adicionados anteriormente que possuíam descrições muito longas ou não traduzidas
UPDATE public.medicamentos
SET acao_principal = 'Controle de Diabetes e Perda de Peso', verified = true
WHERE nome ILIKE 'MOUNJARO';

UPDATE public.medicamentos
SET acao_principal = 'Anti-gases', verified = true
WHERE nome ILIKE 'SIMETICONA';
