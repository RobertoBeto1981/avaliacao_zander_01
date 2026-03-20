import { supabase } from '@/lib/supabase/client'

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data || []
}

export const markAsRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  if (error) throw error
}

export const sendBulkMessage = async (targetRole: string, title: string, message: string) => {
  const { error } = await supabase.rpc('send_bulk_message', {
    p_target_role: targetRole,
    p_title: title,
    p_message: message,
  })
  if (error) throw error
}
