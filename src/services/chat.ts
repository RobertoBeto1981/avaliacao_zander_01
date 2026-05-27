import { supabase } from '@/lib/supabase/client'

export const getMessages = async (contactId: string, contactType: 'user' | 'group') => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return []

  let query = supabase
    .from('internal_chats')
    .select(`
    *,
    sender:sender_id (nome, role),
    avaliacao:avaliacao_id (id, nome_cliente, status)
  `)
    .order('created_at', { ascending: true })

  if (contactType === 'group') {
    query = query.eq('target_role', contactId)
  } else {
    query = query.or(
      `and(sender_id.eq.${user.user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.user.id})`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const sendMessage = async (payload: {
  receiver_id?: string | null
  target_role?: string | null
  message: string
  avaliacao_id?: string | null
}) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('internal_chats')
    .insert({
      ...payload,
      sender_id: user.user.id,
    })
    .select()
    .single()

  if (error) throw error

  if (payload.avaliacao_id) {
    await supabase.from('avaliacao_acompanhamentos').insert({
      avaliacao_id: payload.avaliacao_id,
      autor_id: user.user.id,
      observacao: payload.message,
      concluido: false,
    })
  }

  return data
}
