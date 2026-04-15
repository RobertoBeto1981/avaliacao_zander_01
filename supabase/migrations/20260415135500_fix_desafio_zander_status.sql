DO $$
BEGIN
  -- Reseta alunos que estão travados com DesafioZander 'ativo' mas já estão com treino 'concluido'
  UPDATE public.avaliacoes
  SET desafio_zander_status = 'nenhum'
  WHERE status = 'concluido' AND desafio_zander_status != 'nenhum';
END $$;
