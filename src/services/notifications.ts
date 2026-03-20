import { supabase } from '@/lib/supabase/client'

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

export const markAsRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  if (error) throw error
}

export const archiveNotification = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_archived: true } as any)
    .eq('id', id)
  if (error) throw error
}

export const archiveAllReadNotifications = async (userId: string) => {
  const { error } = (await supabase
    .from('notifications')
    .update({ is_archived: true } as any)
    .eq('user_id', userId)
    .eq('is_read', true)
    .eq('is_archived', false)) as any
  if (error) throw error
}

export const sendBulkMessage = async (
  targetRole: string,
  title: string,
  message: string,
  priority: string = 'normal',
) => {
  const { error } = await supabase.rpc('send_bulk_message', {
    p_target_role: targetRole,
    p_title: title,
    p_message: message,
    p_priority: priority,
  } as any)
  if (error) throw error
}

export const getSentMessagesStats = async () => {
  const { data, error } = await (supabase as any)
    .from('bulk_messages')
    .select(`
      *,
      notifications (
        id,
        is_read,
        users (
          id,
          nome,
          foto_url
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
