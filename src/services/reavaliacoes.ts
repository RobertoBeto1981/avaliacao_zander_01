import { supabase } from '@/lib/supabase/client'

export function calculateEvolucao(oldData: any, newData: any) {
  // Mantemos a função para retrocompatibilidade, mas não a usaremos mais na UI do comparativo
  // pois a nova UI usa campos fixos lado a lado sem julgamento de valor.
  return []
}

export const createReavaliacao = async (
  avaliacaoId: string,
  respostasNovas: any,
  evolucao: any,
  dataReavaliacao: string,
) => {
  const { data: oldAvaliacao } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('id', avaliacaoId)
    .single()

  const { data: oldLinks } = await supabase
    .from('links_avaliacao')
    .select('*')
    .eq('avaliacao_id', avaliacaoId)
    .maybeSingle()

  const { data: existingReavs } = await supabase
    .from('reavaliacoes')
    .select('id')
    .eq('avaliacao_original_id', avaliacaoId)
    .order('created_at', { ascending: true })

  // Se é a primeira reavaliação, salva o snapshot da avaliação original
  if (oldAvaliacao && existingReavs && existingReavs.length === 0) {
    await supabase.from('reavaliacoes').insert({
      avaliacao_original_id: avaliacaoId,
      data_reavaliacao: oldAvaliacao.data_avaliacao || new Date().toISOString().split('T')[0],
      respostas_novas: {
        ...oldAvaliacao.respostas,
        objectives: oldAvaliacao.objectives,
        periodo_treino: oldAvaliacao.periodo_treino,
        client_links: oldLinks
          ? {
              symptoms: oldLinks.mapeamento_sintomas_url,
              pain: oldLinks.mapeamento_dor_url,
              bia: oldLinks.bia_url,
              myscore: oldLinks.my_score_url,
              pdf: oldLinks.relatorio_pdf_url,
              anamnese: oldLinks.anamnese_url,
            }
          : null,
      },
      evolucao: [],
      created_at: oldAvaliacao.created_at || new Date().toISOString(),
    })
  }

  // Cria o snapshot da reavaliação atual (já contém client_links dentro de respostasNovas)
  const { data, error } = await supabase
    .from('reavaliacoes')
    .insert({
      avaliacao_original_id: avaliacaoId,
      data_reavaliacao: dataReavaliacao,
      respostas_novas: respostasNovas,
      evolucao: evolucao,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Atualiza as datas e respostas da avaliação original
  const newReavDate = new Date(dataReavaliacao + 'T12:00:00')
  newReavDate.setDate(newReavDate.getDate() + 90)
  const nextReavDateStr = newReavDate.toISOString().split('T')[0]

  const { objectives, periodo_treino, client_links, ...restRespostas } = respostasNovas

  const updatePayload: any = {
    data_avaliacao: dataReavaliacao,
    data_reavaliacao: nextReavDateStr,
    objectives: objectives,
    periodo_treino: periodo_treino,
    respostas: restRespostas,
    status: 'pendente',
  }

  // Se o período de treino mudou, forçamos a redistribuição retirando o professor atual
  if (oldAvaliacao && oldAvaliacao.periodo_treino !== periodo_treino) {
    updatePayload.professor_id = null
  }

  await supabase.from('avaliacoes').update(updatePayload).eq('id', avaliacaoId)

  // Atualiza a tabela de links para a versão atual (latest)
  if (client_links) {
    await supabase
      .from('links_avaliacao')
      .update({
        mapeamento_sintomas_url: client_links.symptoms,
        mapeamento_dor_url: client_links.pain,
        bia_url: client_links.bia,
        my_score_url: client_links.myscore,
      })
      .eq('avaliacao_id', avaliacaoId)
  }

  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const getAvaliacaoHistory = async (avaliacaoId: string) => {
  const [origRes, reavRes] = await Promise.all([
    supabase.from('avaliacoes').select('*').eq('id', avaliacaoId).single(),
    supabase
      .from('reavaliacoes')
      .select('*')
      .eq('avaliacao_original_id', avaliacaoId)
      .order('created_at', { ascending: true }),
  ])

  if (origRes.error) throw origRes.error

  return {
    original: origRes.data,
    reavaliacoes: reavRes.data || [],
  }
}

export const getReavaliacoesByAvaliacao = async (avaliacaoId: string) => {
  const { data, error } = await supabase
    .from('reavaliacoes')
    .select('*')
    .eq('avaliacao_original_id', avaliacaoId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const getReavaliacaoById = async (id: string) => {
  const { data, error } = await supabase
    .from('reavaliacoes')
    .select(
      '*, avaliacao:avaliacao_original_id (id, nome_cliente, telefone_cliente, evo_id, professor_id, avaliador_id)',
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
