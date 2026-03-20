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
