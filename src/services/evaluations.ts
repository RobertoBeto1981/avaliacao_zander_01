import { supabase } from '@/lib/supabase/client'

const isValidUUID = (uuid: string) => {
  if (!uuid) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export const createEvaluation = async (avaliacao: any, links: any, existingId?: string) => {
  const { data: userData } = await supabase.auth.getUser()

  let result
  let targetId = existingId

  if (!targetId && avaliacao.evo_id) {
    const { data: existingPre } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('evo_id', avaliacao.evo_id)
      .eq('is_pre_avaliacao', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPre) {
      targetId = existingPre.id
    }
  }

  if (targetId) {
    if (!isValidUUID(targetId)) throw new Error('ID de avaliação inválido')

    const { data, error } = await supabase
      .from('avaliacoes')
      .update({ ...avaliacao, is_pre_avaliacao: false, avaliador_id: userData.user?.id })
      .eq('id', targetId)
      .select()
      .single()
    if (error) throw error
    result = data
  } else {
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert({ ...avaliacao, is_pre_avaliacao: false, avaliador_id: userData.user?.id })
      .select()
      .single()
    if (error) throw error
    result = data
  }

  if (links && Object.values(links).some((v) => v)) {
    const { data: existingLinks } = await supabase
      .from('links_avaliacao')
      .select('id')
      .eq('avaliacao_id', result.id)
      .limit(1)
      .maybeSingle()

    if (existingLinks) {
      const { error: linksError } = await supabase
        .from('links_avaliacao')
        .update(links)
        .eq('id', existingLinks.id)
      if (linksError) throw linksError
    } else {
      const { error: linksError } = await supabase.from('links_avaliacao').insert({
        ...links,
        avaliacao_id: result.id,
      })
      if (linksError) throw linksError
    }
  }
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return result
}

export const updateEvaluationFull = async (id: string, avaliacao: any, links: any) => {
  if (!isValidUUID(id)) throw new Error('ID de avaliação inválido')

  const { data, error } = await supabase
    .from('avaliacoes')
    .update(avaliacao)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (links && Object.values(links).some((v) => v)) {
    const { data: existingLinks } = await supabase
      .from('links_avaliacao')
      .select('id')
      .eq('avaliacao_id', id)
      .limit(1)
      .maybeSingle()

    if (existingLinks) {
      const { error: linksError } = await supabase
        .from('links_avaliacao')
        .update(links)
        .eq('id', existingLinks.id)
      if (linksError) throw linksError
    } else {
      const { error: linksError } = await supabase.from('links_avaliacao').insert({
        ...links,
        avaliacao_id: id,
      })
      if (linksError) throw linksError
    }
  }

  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const createPreAvaliacao = async (data: {
  evo_id: string
  nome_cliente: string
  telefone_cliente?: string
}) => {
  if (data.evo_id) {
    const { data: existing } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('evo_id', data.evo_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      const payload: any = {
        nome_cliente: data.nome_cliente,
      }
      if (data.telefone_cliente) {
        payload.telefone_cliente = data.telefone_cliente
      }

      const { data: result, error } = await supabase
        .from('avaliacoes')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      window.dispatchEvent(new CustomEvent('avaliacao_updated'))
      return result
    }
  }

  const payload: any = {
    evo_id: data.evo_id,
    nome_cliente: data.nome_cliente,
    telefone_cliente: data.telefone_cliente,
    is_pre_avaliacao: true,
    data_avaliacao: null,
    data_reavaliacao: null,
    status: 'pendente',
    avaliador_id: null,
  }

  const { data: result, error } = await supabase
    .from('avaliacoes')
    .insert(payload)
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
    .order('created_at', { ascending: false })
    .limit(1)
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
  if (!isValidUUID(id)) throw new Error('ID de avaliação inválido')

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
  if (!isValidUUID(id)) throw new Error('ID de avaliação inválido')

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

export const deleteEvaluation = async (id: string) => {
  if (!isValidUUID(id)) throw new Error('ID de avaliação inválido')
  const { error } = await supabase.from('avaliacoes').delete().eq('id', id)
  if (error) throw error
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
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
