import { supabase } from '@/lib/supabase/client'

export const getProfile = async (id: string) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const updateProfile = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const uploadAvatar = async (id: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const filePath = `${id}-${Math.random()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('profiles').getPublicUrl(filePath)
  return data.publicUrl
}
