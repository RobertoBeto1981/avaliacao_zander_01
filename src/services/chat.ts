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

export const deleteChatMessage = async (id: string) => {
  const { error } = await supabase.from('internal_chats').delete().eq('id', id)
  if (error) throw error
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
    const { data: lastAcomp } = await supabase
      .from('avaliacao_acompanhamentos')
      .select('id, observacao, concluido, autor_id, created_at')
      .eq('avaliacao_id', payload.avaliacao_id)
      .eq('autor_id', user.user.id)
      .eq('concluido', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastAcomp) {
      const hoursDiff =
        (new Date().getTime() - new Date(lastAcomp.created_at).getTime()) / (1000 * 60 * 60)

      if (hoursDiff < 24) {
        await supabase
          .from('avaliacao_acompanhamentos')
          .update({ observacao: lastAcomp.observacao + '\n\n' + payload.message })
          .eq('id', lastAcomp.id)
      } else {
        await supabase.from('avaliacao_acompanhamentos').insert({
          avaliacao_id: payload.avaliacao_id,
          autor_id: user.user.id,
          observacao: payload.message,
          concluido: false,
        })
      }
    } else {
      await supabase.from('avaliacao_acompanhamentos').insert({
        avaliacao_id: payload.avaliacao_id,
        autor_id: user.user.id,
        observacao: payload.message,
        concluido: false,
      })
    }
  }

  return data
}
