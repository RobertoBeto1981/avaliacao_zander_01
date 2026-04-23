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
        telefone_cliente,
        data_avaliacao,
        evo_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const deleteVideoConfig = async (dias_trigger: number) => {
  const { error } = await supabase
    .from('video_automations_config')
    .delete()
    .eq('dias_trigger', dias_trigger)

  if (error) throw error
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

export const getPendingVideosForToday = async () => {
  const { data: configs, error: cfgError } = await supabase
    .from('video_automations_config')
    .select('*')
    .eq('is_active', true)

  if (cfgError) throw cfgError
  if (!configs || configs.length === 0) return []

  const { data: agendados, error: agError } = await supabase
    .from('videos_agendados')
    .select(`
      *,
      avaliacoes (
        id,
        nome_cliente,
        telefone_cliente,
        data_avaliacao,
        evo_id
      )
    `)
    .eq('status', 'pendente')

  if (agError) throw agError
  if (!agendados || agendados.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pendingQueue: any[] = []

  for (const item of agendados) {
    if (!item.avaliacoes?.data_avaliacao) continue

    const config = configs.find((c) => c.dias_trigger === item.dias_apos_avaliacao)
    if (!config) continue

    const dataAvaliacao = new Date(item.avaliacoes.data_avaliacao + 'T00:00:00')
    const triggerDate = new Date(dataAvaliacao)
    triggerDate.setDate(triggerDate.getDate() + item.dias_apos_avaliacao)
    triggerDate.setHours(0, 0, 0, 0)

    if (triggerDate.getTime() <= today.getTime()) {
      pendingQueue.push({
        agendado_id: item.id,
        avaliacao: item.avaliacoes,
        config: config,
        data_estimada: triggerDate,
        url_google_drive: item.url_google_drive,
      })
    }
  }

  return pendingQueue.sort((a, b) => {
    // Sort by late first, then by trigger days
    if (a.data_estimada.getTime() !== b.data_estimada.getTime()) {
      return a.data_estimada.getTime() - b.data_estimada.getTime()
    }
    return a.config.dias_trigger - b.config.dias_trigger
  })
}

export const logVideoSent = async (
  avaliacaoId: string,
  diasTrigger: number,
  videoUrl: string | null,
  agendadoId?: string,
) => {
  if (agendadoId) {
    const { data, error } = await supabase
      .from('videos_agendados')
      .update({
        url_google_drive: videoUrl,
        status: 'enviado',
        data_envio: new Date().toISOString(),
      })
      .eq('id', agendadoId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('videos_agendados')
    .update({
      url_google_drive: videoUrl,
      status: 'enviado',
      data_envio: new Date().toISOString(),
    })
    .eq('avaliacao_id', avaliacaoId)
    .eq('dias_apos_avaliacao', diasTrigger)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSentDesafiosHistory = async () => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id, nome_cliente, telefone_cliente, evo_id, desafio_zander_enviado_em')
    .eq('desafio_zander_status', 'enviado')
    .not('desafio_zander_enviado_em', 'is', null)

  if (error) throw error
  return data || []
}
