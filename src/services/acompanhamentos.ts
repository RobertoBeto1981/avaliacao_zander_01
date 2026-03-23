import { supabase } from '@/lib/supabase/client'

export const getAcompanhamentos = async (avaliacaoId: string) => {
  if (!avaliacaoId) return []

  try {
    const { data, error } = await supabase
      .from('avaliacao_acompanhamentos')
      .select(`
        *,
        autor:users!avaliacao_acompanhamentos_autor_id_fkey(nome, foto_url)
      `)
      .eq('avaliacao_id', avaliacaoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.warn('Erro de conexão ao buscar acompanhamentos:', error)
    throw new Error(
      'Não foi possível carregar os acompanhamentos. Verifique sua conexão e tente novamente.',
    )
  }
}

export const addAcompanhamento = async (acompanhamento: any) => {
  try {
    const { data, error } = await supabase
      .from('avaliacao_acompanhamentos')
      .insert(acompanhamento)
      .select(`
        *,
        autor:users!avaliacao_acompanhamentos_autor_id_fkey(nome, foto_url)
      `)
      .single()

    if (error) throw error
    window.dispatchEvent(new CustomEvent('acompanhamento_updated'))
    return data
  } catch (error: any) {
    console.warn('Erro de conexão ao adicionar acompanhamento:', error)
    throw new Error('Falha ao registrar acompanhamento. Verifique sua conexão.')
  }
}

export const toggleAcompanhamento = async (id: string, concluido: boolean) => {
  try {
    const { data, error } = await supabase
      .from('avaliacao_acompanhamentos')
      .update({ concluido, concluido_em: concluido ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    window.dispatchEvent(new CustomEvent('acompanhamento_updated'))
    return data
  } catch (error: any) {
    console.warn('Erro de conexão ao atualizar acompanhamento:', error)
    throw new Error('Falha ao atualizar o status da tarefa. Verifique sua conexão.')
  }
}

export const getPendingAcompanhamentos = async (userId: string) => {
  if (!userId) return []

  try {
    const date = new Date()
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    const today = localDate.toISOString().split('T')[0]

    // Refinamento da Query com relacionamento explícito para evitar ambiguidades e otimizar a busca
    const { data, error } = await supabase
      .from('avaliacao_acompanhamentos')
      .select(`
        *,
        avaliacao:avaliacoes!avaliacao_acompanhamentos_avaliacao_id_fkey(nome_cliente)
      `)
      .eq('autor_id', userId)
      .eq('concluido', false)
      .not('prazo', 'is', null)
      .lte('prazo', today)

    if (error) {
      console.warn('Falha ao buscar acompanhamentos pendentes do banco:', error)
      return []
    }
    return data || []
  } catch (error) {
    // Tratamento de segurança para oscilações de rede (impede que a página quebre)
    console.warn(
      'Oscilação de rede detectada ao buscar pendências. Carregamento bypassado de forma segura.',
      error,
    )
    return []
  }
}
