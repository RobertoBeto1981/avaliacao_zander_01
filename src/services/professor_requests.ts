import { supabase } from '@/lib/supabase/client'

export const requestProfessorChange = async (avaliacaoId: string, professorId: string) => {
  const { data, error } = await supabase
    .from('professor_change_requests')
    .insert({ avaliacao_id: avaliacaoId, professor_id: professorId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getPendingProfessorRequests = async () => {
  const { data, error } = await supabase
    .from('professor_change_requests')
    .select('*, avaliacao:avaliacoes(nome_cliente), professor:users(nome)')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const respondProfessorRequest = async (
  requestId: string,
  status: 'aprovado' | 'rejeitado',
  avaliacaoId?: string,
  professorId?: string,
) => {
  const { error } = await supabase
    .from('professor_change_requests')
    .update({ status })
    .eq('id', requestId)
  if (error) throw error

  if (status === 'aprovado' && avaliacaoId && professorId) {
    const { error: updateError } = await supabase
      .from('avaliacoes')
      .update({ professor_id: professorId })
      .eq('id', avaliacaoId)
    if (updateError) throw updateError
  }
}

export const updateAvaliacaoProfessor = async (avaliacaoId: string, professorId: string | null) => {
  const { error } = await supabase
    .from('avaliacoes')
    .update({ professor_id: professorId })
    .eq('id', avaliacaoId)
  if (error) throw error
}
