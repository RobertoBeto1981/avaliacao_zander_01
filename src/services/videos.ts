import { supabase } from '@/lib/supabase/client'

export const scheduleVideo = async (data: {
  avaliacao_id: string
  dias_apos_avaliacao: number
  url_google_drive: string
}) => {
  const { data: result, error } = await supabase
    .from('videos_agendados')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export const getScheduledVideos = async () => {
  const { data, error } = await supabase
    .from('videos_agendados')
    .select(`
      *,
      avaliacoes (
        id,
        nome_cliente,
        data_avaliacao
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
