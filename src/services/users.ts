import { supabase } from '@/lib/supabase/client'

export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('nome')
  if (error) throw error
  return data || []
}

export const updateUser = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteUserCompletely = async (id: string) => {
  const { error } = await supabase.rpc('delete_user_completely', { target_user_id: id })
  if (error) throw error
}
