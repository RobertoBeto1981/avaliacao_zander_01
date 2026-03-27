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

export const getPendingVideosForToday = async () => {
  const { data: configs, error: cfgError } = await supabase
    .from('video_automations_config')
    .select('*')
    .eq('is_active', true)

  if (cfgError) throw cfgError
  if (!configs || configs.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDates = configs.map((c) => {
    const d = new Date(today)
    d.setDate(d.getDate() - c.dias_trigger)
    return {
      dateStr: d.toISOString().split('T')[0],
      config: c,
    }
  })

  const datesToQuery = targetDates.map((td) => td.dateStr)

  const { data: avaliacoes, error: avError } = await supabase
    .from('avaliacoes')
    .select('id, nome_cliente, telefone_cliente, data_avaliacao')
    .in('data_avaliacao', datesToQuery)
    .eq('is_pre_avaliacao', false)

  if (avError) throw avError
  if (!avaliacoes || avaliacoes.length === 0) return []

  const evalIds = avaliacoes.map((a) => a.id)

  // Find already sent videos for these evaluations
  const { data: sentLogs, error: logError } = await supabase
    .from('videos_agendados')
    .select('avaliacao_id, dias_apos_avaliacao, status')
    .in('avaliacao_id', evalIds)
    .eq('status', 'enviado')

  if (logError) throw logError

  const sentMap = new Set(sentLogs?.map((l) => `${l.avaliacao_id}_${l.dias_apos_avaliacao}`) || [])

  const pendingQueue: any[] = []

  for (const av of avaliacoes) {
    const matchedTargets = targetDates.filter((td) => td.dateStr === av.data_avaliacao)
    for (const target of matchedTargets) {
      const { config } = target
      if (!sentMap.has(`${av.id}_${config.dias_trigger}`)) {
        pendingQueue.push({
          avaliacao: av,
          config: config,
        })
      }
    }
  }

  // Sort queue by trigger days
  return pendingQueue.sort((a, b) => a.config.dias_trigger - b.config.dias_trigger)
}

export const logVideoSent = async (
  avaliacaoId: string,
  diasTrigger: number,
  videoUrl: string | null,
) => {
  const { data, error } = await supabase
    .from('videos_agendados')
    .insert({
      avaliacao_id: avaliacaoId,
      dias_apos_avaliacao: diasTrigger,
      url_google_drive: videoUrl,
      status: 'enviado',
      data_envio: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}
