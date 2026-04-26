import { supabase } from '@/lib/supabase/client'
import { calculateDeadline } from '@/lib/holidays'

const isValidUUID = (uuid: string) => {
  if (!uuid) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export const createEvaluation = async (avaliacao: any, links: any, existingId?: string) => {
  const { data: userData } = await supabase.auth.getUser()

  let result
  let targetId = existingId

  if (!targetId && avaliacao.evo_id) {
    const cleanEvo = String(avaliacao.evo_id).trim()
    const { data: existingPre } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('evo_id', cleanEvo)
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

  if (links) {
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
    } else if (Object.values(links).some((v) => v)) {
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
  professor_id?: string
}) => {
  const cleanEvo = data.evo_id ? String(data.evo_id).trim() : null

  if (cleanEvo) {
    const { data: existing } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('evo_id', cleanEvo)
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
      if (data.professor_id) {
        payload.professor_id = data.professor_id
      }

      const { data: result, error } = await supabase
        .from('avaliacoes')
        .update(payload)
        .eq('id', existing.id)
        .select()

      if (error) throw error

      if (!result || result.length === 0) {
        if (data.professor_id) {
          const rpcPayload: any = {
            p_evo_id: cleanEvo,
            p_nome_cliente: data.nome_cliente,
            p_telefone_cliente: data.telefone_cliente || '',
            p_professor_id: data.professor_id,
          }
          const { data: rpcRes, error: rpcErr } = await supabase.rpc(
            'upsert_aluno_dialog',
            rpcPayload,
          )

          if (rpcErr) throw rpcErr

          const responsePayload = rpcRes as any
          if (responsePayload && responsePayload.success === false) {
            throw new Error(
              responsePayload.message || 'Este ID EVO já está vinculado a outro professor.',
            )
          }

          const { data: finalFetch } = await supabase
            .from('avaliacoes')
            .select('*')
            .eq('id', existing.id)
            .maybeSingle()

          window.dispatchEvent(new CustomEvent('avaliacao_updated'))
          return finalFetch || existing
        } else {
          throw new Error('Sem permissão para atualizar este cadastro ou registro não encontrado.')
        }
      }

      window.dispatchEvent(new CustomEvent('avaliacao_updated'))
      return result[0]
    }
  }

  const payload: any = {
    evo_id: cleanEvo,
    nome_cliente: data.nome_cliente,
    telefone_cliente: data.telefone_cliente,
    is_pre_avaliacao: true,
    data_avaliacao: null,
    data_reavaliacao: null,
    status: 'pendente',
    avaliador_id: null,
    professor_id: data.professor_id || null,
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
  const cleanEvo = String(evoId).trim()
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id, nome_cliente, telefone_cliente')
    .eq('evo_id', cleanEvo)
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

export const activateDesafioZander = async (id: string) => {
  if (!isValidUUID(id)) throw new Error('ID de avaliação inválido')

  const { data: ev, error: fetchErr } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  let professor_id = ev.professor_id

  if (!professor_id) {
    const { data: allUsers } = await supabase.from('users').select('id, roles, role, ativo')
    const activeProfs =
      allUsers?.filter(
        (u: any) => u.ativo && (u.roles?.includes('professor') || u.role === 'professor'),
      ) || []

    if (activeProfs.length > 0) {
      const { data: pendingEvals } = await supabase
        .from('avaliacoes')
        .select('professor_id')
        .in('status', ['pendente', 'em_progresso'])
        .not('professor_id', 'is', null)

      const workload: Record<string, number> = {}
      activeProfs.forEach((p: any) => (workload[p.id] = 0))

      pendingEvals?.forEach((e: any) => {
        if (e.professor_id && workload[e.professor_id] !== undefined) {
          workload[e.professor_id]++
        }
      })

      activeProfs.sort((a: any, b: any) => workload[a.id] - workload[b.id])
      professor_id = activeProfs[0].id
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const updates: any = {
    desafio_zander_status: 'ativado',
    desafio_zander_ativado_em: new Date().toISOString(),
    status: 'pendente',
    professor_id,
    is_pre_avaliacao: false,
  }

  const { data, error } = await supabase
    .from('avaliacoes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const { data: userData } = await supabase.auth.getUser()
  const currentUserId = userData.user?.id

  if (currentUserId) {
    const deadlineDate = calculateDeadline(todayStr, 3)
    await supabase.from('avaliacao_acompanhamentos').insert({
      avaliacao_id: id,
      autor_id: currentUserId,
      observacao:
        '🔥 Aluno aceitou o #DesafioZander! Entrar em contato em até 3 dias úteis para acompanhamento.',
      prazo: deadlineDate.toISOString().split('T')[0],
      concluido: false,
    })
  }

  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const markDesafioZanderSent = async (id: string) => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .update({
      desafio_zander_status: 'enviado',
      desafio_zander_enviado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const getPendingDesafioZander = async () => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id, nome_cliente, telefone_cliente, desafio_zander_status')
    .eq('desafio_zander_status', 'ativado')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const requestStudentAssignment = async (avaliacaoId: string, professorId: string) => {
  const { data, error } = await supabase
    .from('professor_change_requests')
    .insert({
      avaliacao_id: avaliacaoId,
      professor_id: professorId,
      status: 'pendente',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getStudentRequestStatus = async (avaliacaoId: string, professorId: string) => {
  const { data } = await supabase
    .from('professor_change_requests')
    .select('status')
    .eq('avaliacao_id', avaliacaoId)
    .eq('professor_id', professorId)
    .eq('status', 'pendente')
    .maybeSingle()
  return data?.status || null
}
