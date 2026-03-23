import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch active video configurations
    const { data: configs, error: cfgError } = await supabase
      .from('video_automations_config')
      .select('*')
      .eq('is_active', true)

    if (cfgError) throw new Error(`Erro ao buscar configurações: ${cfgError.message}`)
    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma automação de vídeo ativa.' }), {
        headers: corsHeaders,
      })
    }

    const waToken = Deno.env.get('WHATSAPP_TOKEN')
    const waPhoneId = Deno.env.get('WHATSAPP_PHONE_ID')
    const results = []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 2. Loop through each active trigger configuration
    for (const config of configs) {
      // Calculate target evaluation date (today - trigger_days)
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() - config.dias_trigger)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      // 3. Find valid evaluations created exactly on targetDate
      const { data: avaliacoes, error: evError } = await supabase
        .from('avaliacoes')
        .select('id, nome_cliente, telefone_cliente')
        .eq('data_avaliacao', targetDateStr)
        .eq('is_pre_avaliacao', false)

      if (evError) {
        console.error(`Erro buscando avaliações para data ${targetDateStr}:`, evError)
        continue
      }

      if (!avaliacoes || avaliacoes.length === 0) continue

      // 4. Process each matched evaluation
      for (const ev of avaliacoes) {
        // Check if already sent or logged
        const { data: log } = await supabase
          .from('videos_agendados')
          .select('id')
          .eq('avaliacao_id', ev.id)
          .eq('dias_apos_avaliacao', config.dias_trigger)
          .maybeSingle()

        if (log) continue // Already processed

        let success = false
        let errorReason = null

        if (!ev.telefone_cliente) {
          errorReason = 'Sem telefone cadastrado'
        } else if (!config.video_url) {
          errorReason = 'Configuração sem URL de vídeo'
        } else {
          let phone = ev.telefone_cliente.replace(/\D/g, '')
          if (!phone.startsWith('55')) phone = '55' + phone

          const firstName = ev.nome_cliente.trim().split(' ')[0]
          const template =
            config.message_template || 'Olá {{nome}}, aqui está seu vídeo: {{link_video}}'
          const message = template
            .replace(/\{\{nome\}\}/g, firstName)
            .replace(/\{\{link_video\}\}/g, config.video_url || '')

          if (waToken && waPhoneId) {
            const waRes = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${waToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'text',
                text: { body: message },
              }),
            })

            if (!waRes.ok) {
              const waData = await waRes.json()
              console.error(`[WhatsApp Error] Eval ${ev.id}:`, waData)
              errorReason = waData.error?.message || 'Falha na API WA'
            } else {
              success = true
            }
          } else {
            console.log(`[SIMULAÇÃO WA] Vídeo Automático -> ${phone}:\n${message}`)
            success = true
          }
        }

        // 5. Insert audit log into videos_agendados
        await supabase.from('videos_agendados').insert({
          avaliacao_id: ev.id,
          dias_apos_avaliacao: config.dias_trigger,
          url_google_drive: config.video_url || null,
          status: success ? 'enviado' : 'erro',
          data_envio: success ? new Date().toISOString() : null,
          error_reason: errorReason,
        })

        results.push({
          avaliacao_id: ev.id,
          dias: config.dias_trigger,
          status: success ? 'enviado' : 'erro',
          reason: errorReason,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rotina de vídeos automáticos executada',
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
