import { supabase } from '@/lib/supabase/client'

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, bulk_messages(file_url, file_name)')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const markAsRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)

  if (error) throw error
}

export const archiveNotification = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_archived: true }).eq('id', id)

  if (error) throw error
}

export const sendBulkMessage = async (
  targetRoles: string[],
  title: string,
  message: string,
  priority: string,
  fileUrl?: string | null,
  fileName?: string | null,
) => {
  const { error } = await supabase.rpc('send_bulk_message', {
    p_target_roles: targetRoles,
    p_title: title,
    p_message: message,
    p_priority: priority,
    p_file_url: fileUrl,
    p_file_name: fileName,
  })

  if (error) throw error
}

export const getSentMessagesStats = async () => {
  const { data, error } = await supabase
    .from('bulk_messages')
    .select('*, notifications(id, is_read, user_id, users(nome, foto_url))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
