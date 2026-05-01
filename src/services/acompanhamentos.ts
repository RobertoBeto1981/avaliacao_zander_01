import { supabase } from '@/lib/supabase/client'

export const getAcompanhamentos = async (avaliacaoId: string) => {
  // We explicitly select nested autor details instead of avaliacao
  // to avoid ambiguous or broken relations error on GET
  const { data, error } = await supabase
    .from('avaliacao_acompanhamentos')
    .select(`
      *,
      autor:autor_id (nome, role)
    `)
    .eq('avaliacao_id', avaliacaoId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export const addAcompanhamento = async (payload: {
  avaliacao_id: string
  autor_id: string
  observacao: string
  prazo?: string | null
  file_url?: string | null
  file_name?: string | null
  file_category?: string | null
}) => {
  const { data, error } = await supabase
    .from('avaliacao_acompanhamentos')
    .insert(payload)
    .select('*, autor:autor_id (nome, role)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const toggleAcompanhamento = async (id: string, concluido: boolean) => {
  const { error } = await supabase
    .from('avaliacao_acompanhamentos')
    .update({
      concluido,
      concluido_em: concluido ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const updateAcompanhamentoFile = async (
  id: string,
  payload: { file_url: string | null; file_name: string | null; file_category: string | null },
) => {
  const { data, error } = await supabase
    .from('avaliacao_acompanhamentos')
    .update(payload)
    .eq('id', id)
    .select('*, autor:autor_id (nome, role)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteAcompanhamento = async (id: string) => {
  const { error } = await supabase.from('avaliacao_acompanhamentos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const getPendingAcompanhamentos = async () => {
  const { data, error } = await supabase
    .from('avaliacao_acompanhamentos')
    .select(`
      *,
      autor:autor_id (nome, role),
      avaliacao:avaliacao_id (id, nome_cliente, evo_id)
    `)
    .eq('concluido', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
