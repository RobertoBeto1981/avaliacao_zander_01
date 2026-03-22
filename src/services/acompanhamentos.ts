import { supabase } from '@/lib/supabase/client'

export const getAcompanhamentos = async (avaliacaoId: string) => {
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
    console.error('Erro em getAcompanhamentos:', error)
    throw new Error(error.message || 'Erro ao buscar acompanhamentos')
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
    console.error('Erro em addAcompanhamento:', error)
    throw new Error(error.message || 'Erro ao adicionar acompanhamento')
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
    console.error('Erro em toggleAcompanhamento:', error)
    throw new Error(error.message || 'Erro ao atualizar acompanhamento')
  }
}

export const getPendingAcompanhamentos = async (userId: string) => {
  try {
    const date = new Date()
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    const today = localDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('avaliacao_acompanhamentos')
      .select(`
        *,
        avaliacao:avaliacoes(nome_cliente)
      `)
      .eq('autor_id', userId)
      .eq('concluido', false)
      .not('prazo', 'is', null)
      .lte('prazo', today)

    if (error) {
      console.error('getPendingAcompanhamentos error:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('getPendingAcompanhamentos exception (Failed to fetch):', error)
    return []
  }
}
