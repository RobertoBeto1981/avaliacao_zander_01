import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // Usa a Service Role Key para contornar o RLS em uma tarefa de background
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // 1. Busca todos os vídeos pendentes junto com os dados da avaliação
    const { data: pendentes, error } = await supabaseClient
      .from('videos_agendados')
      .select(`
        id,
        dias_apos_avaliacao,
        url_google_drive,
        status,
        avaliacoes!inner (
          id,
          nome_cliente,
          telefone_cliente,
          data_avaliacao
        )
      `)
      .eq('status', 'pendente')

    if (error) {
      throw new Error(`Erro ao buscar vídeos: ${error.message}`)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // 2. Filtra os vídeos onde data_avaliacao + dias_apos_avaliacao <= hoje
    const videosToProcess = (pendentes || []).filter((video) => {
      const dataAvaliacao = new Date(video.avaliacoes.data_avaliacao)
      const targetDate = new Date(dataAvaliacao)
      targetDate.setDate(targetDate.getDate() + video.dias_apos_avaliacao)
      const targetDateStr = targetDate.toISOString().split('T')[0]
      return targetDateStr <= todayStr
    })

    const waToken = Deno.env.get('WHATSAPP_TOKEN')
    const waPhoneId = Deno.env.get('WHATSAPP_PHONE_ID')
    const results = []

    for (const video of videosToProcess) {
      const cliente = video.avaliacoes

      if (!cliente.telefone_cliente) {
        results.push({ id: video.id, status: 'error', reason: 'Sem telefone' })
        continue
      }

      let phone = cliente.telefone_cliente.replace(/\D/g, '')
      if (!phone.startsWith('55')) {
        phone = '55' + phone
      }

      const firstName = cliente.nome_cliente.trim().split(' ')[0]

      // 3. Prepara a mensagem adaptada para vídeos
      const message = `Olá *${firstName}*, tudo bem?\n\nConforme o seu planejamento de acompanhamento, aqui está o seu vídeo de hoje:\n\n🎥 ${video.url_google_drive}\n\nAssista e, qualquer dúvida, estamos à disposição!`

      let success = false

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
          console.error(`[WhatsApp Error] Vídeo ${video.id}:`, waData)
          results.push({ id: video.id, status: 'error', reason: 'Falha na API WA' })
          continue // pula o update para enviado em caso de falha na API
        }
        success = true
      } else {
        console.log(`[SIMULAÇÃO WA] Vídeo ${video.id} -> ${phone}:\n${message}`)
        success = true
      }

      // 4. Atualiza o status para 'enviado' e registra a data_envio
      if (success) {
        const { error: updateError } = await supabaseClient
          .from('videos_agendados')
          .update({
            status: 'enviado',
            data_envio: new Date().toISOString(),
          })
          .eq('id', video.id)

        if (updateError) {
          console.error(`Erro ao atualizar vídeo ${video.id}:`, updateError)
          results.push({ id: video.id, status: 'error', reason: 'Falha no DB update' })
        } else {
          results.push({ id: video.id, status: 'success' })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rotina de envio de vídeos executada com sucesso',
        processed: videosToProcess.length,
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
