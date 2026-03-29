import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js'

// Função para envio dos links da avaliação física via WhatsApp
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { avaliacaoId } = await req.json()

    if (!avaliacaoId) {
      throw new Error('avaliacaoId é obrigatório')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      throw new Error('Não autorizado')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: avaliacao, error } = await supabaseClient
      .from('avaliacoes')
      .select(`
        nome_cliente,
        telefone_cliente,
        links_avaliacao (
          anamnese_url,
          mapeamento_sintomas_url,
          mapeamento_dor_url,
          bia_url,
          my_score_url
        )
      `)
      .eq('id', avaliacaoId)
      .single()

    if (error || !avaliacao) {
      throw new Error('Avaliação não encontrada')
    }

    if (!avaliacao.telefone_cliente) {
      throw new Error('Cliente não possui telefone cadastrado')
    }

    const links = avaliacao.links_avaliacao?.[0]
    if (!links) {
      throw new Error('Links não encontrados para esta avaliação')
    }

    let phone = avaliacao.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) {
      phone = '55' + phone
    }

    const firstName = avaliacao.nome_cliente.trim().split(' ')[0]

    const { data: tplData } = await supabaseClient
      .from('message_templates')
      .select('template')
      .eq('id', 'links_avaliacao')
      .single()
    let text =
      tplData?.template ||
      `Olá, {{nome}}, tudo bem?\n\nAbaixo estão os links da sua avaliação:\n\n{{links}}\n\nMuito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! 💙`

    let linksStr = ''
    if (links.anamnese_url) linksStr += `📝 *Anamnese:* ${links.anamnese_url}\n`
    if (links.mapeamento_sintomas_url)
      linksStr += `🔍 *Sintomas:* ${links.mapeamento_sintomas_url}\n`
    if (links.mapeamento_dor_url) linksStr += `🎯 *Dor:* ${links.mapeamento_dor_url}\n`
    if (links.bia_url) linksStr += `⚖️ *BIA:* ${links.bia_url}\n`
    if (links.my_score_url) linksStr += `📊 *My Score:* ${links.my_score_url}\n`

    const message = text.replace(/{{nome}}/g, firstName).replace(/{{links}}/g, linksStr.trim())

    const waToken = Deno.env.get('WHATSAPP_TOKEN')
    const waPhoneId = Deno.env.get('WHATSAPP_PHONE_ID')

    if (!waToken || !waPhoneId) {
      console.warn('WhatsApp credentials not set. Simulating success.')
      return new Response(
        JSON.stringify({ success: true, simulated: true, message: 'Simulado com sucesso' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

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
        text: {
          body: message,
        },
      }),
    })

    const waData = await waRes.json()

    if (!waRes.ok) {
      console.error('WhatsApp API Error:', waData)
      throw new Error(waData.error?.message || 'Falha ao enviar mensagem pelo WhatsApp')
    }

    return new Response(JSON.stringify({ success: true, data: waData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
