import { supabase } from '@/lib/supabase/client'

export const createEvaluation = async (avaliacao: any, links: any) => {
  const { data: result, error } = await supabase
    .from('avaliacoes')
    .insert(avaliacao)
    .select()
    .single()
  if (error) throw error

  if (links && Object.values(links).some((v) => v)) {
    const { error: linksError } = await supabase.from('links_avaliacao').insert({
      ...links,
      avaliacao_id: result.id,
    })
    if (linksError) throw linksError
  }
  return result
}

export const getEvaluations = async () => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      users:avaliador_id (nome),
      links_avaliacao (*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const getEvaluationById = async (id: string) => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      users:avaliador_id (nome),
      links_avaliacao (*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const updateEvaluationStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
