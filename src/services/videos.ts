import { supabase } from '@/lib/supabase/client'

export const scheduleVideo = async (data: {
  avaliacao_id: string
  dias_apos_avaliacao: number
  url_google_drive?: string
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
        data_avaliacao,
        evo_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getVideoConfigs = async () => {
  const { data, error } = await supabase
    .from('video_automations_config')
    .select('*')
    .order('dias_trigger', { ascending: true })

  if (error) throw error
  return data || []
}

export const saveVideoConfig = async (config: any) => {
  const { data, error } = await supabase
    .from('video_automations_config')
    .upsert(
      {
        dias_trigger: config.dias_trigger,
        video_url: config.video_url,
        message_template: config.message_template,
        is_active: config.is_active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'dias_trigger' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export const uploadVideoFile = async (file: File, triggerDays: number) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `video_trigger_${triggerDays}_${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
  return data.publicUrl
}
