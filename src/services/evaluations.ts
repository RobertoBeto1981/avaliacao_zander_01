import { supabase } from '@/lib/supabase/client'

export const createEvaluation = async (avaliacao: any, links: any, existingId?: string) => {
  const { data: userData } = await supabase.auth.getUser()

  let result
  if (existingId) {
    const { data, error } = await supabase
      .from('avaliacoes')
      .update({ ...avaliacao, is_pre_avaliacao: false, avaliador_id: userData.user?.id })
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw error
    result = data
  } else {
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert({ ...avaliacao, is_pre_avaliacao: false })
      .select()
      .single()
    if (error) throw error
    result = data
  }

  if (links && Object.values(links).some((v) => v)) {
    const { error: linksError } = await supabase.from('links_avaliacao').insert({
      ...links,
      avaliacao_id: result.id,
    })
    if (linksError) throw linksError
  }
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return result
}

export const createPreAvaliacao = async (data: {
  evo_id: string
  nome_cliente: string
  telefone_cliente?: string
  professor_id: string
}) => {
  const { data: result, error } = await supabase
    .from('avaliacoes')
    .insert({
      evo_id: data.evo_id,
      nome_cliente: data.nome_cliente,
      telefone_cliente: data.telefone_cliente,
      professor_id: data.professor_id,
      is_pre_avaliacao: true,
      data_avaliacao: new Date().toISOString().split('T')[0],
      data_reavaliacao: new Date().toISOString().split('T')[0],
      status: 'pendente',
    })
    .select()
    .single()

  if (error) throw error
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return result
}

export const getPreAvaliacaoByEvoId = async (evoId: string) => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id, nome_cliente, telefone_cliente')
    .eq('evo_id', evoId)
    .eq('is_pre_avaliacao', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export const getEvaluations = async () => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      avaliador:users!avaliacoes_avaliador_id_fkey (nome),
      professor:users!avaliacoes_professor_id_fkey (nome),
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
      avaliador:users!avaliacoes_avaliador_id_fkey (nome),
      professor:users!avaliacoes_professor_id_fkey (nome),
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
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const getClientPastMedications = async (clientName: string) => {
  if (!clientName || clientName.trim().length < 3) return []

  const { data, error } = await supabase
    .from('avaliacoes')
    .select('respostas')
    .ilike('nome_cliente', `%${clientName.trim()}%`)
    .not('respostas', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching past medications:', error)
    return []
  }

  const allMeds = new Set<string>()

  data?.forEach((ev) => {
    const meds = (ev.respostas as any)?.medications
    if (meds?.choice && meds?.list && typeof meds.list === 'string') {
      const lines = meds.list
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
      lines.forEach((l: string) => allMeds.add(l))
    }
  })

  return Array.from(allMeds)
}
