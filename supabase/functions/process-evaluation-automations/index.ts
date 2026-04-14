import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js'

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
          relatorio_pdf_url
        )
      `)
      .eq('id', avaliacaoId)
      .single()

    if (error || !avaliacao) {
      throw new Error('Avaliação não encontrada')
    }

    const phone = avaliacao.telefone_cliente
    const links = avaliacao.links_avaliacao?.[0]
    const pdfUrl = links?.relatorio_pdf_url

    // --- INFRAESTRUTURA PREPARADA PARA WHATSAPP BUSINESS API ---
    console.log(
      `[AUTOMAÇÃO - WHATSAPP] Iniciando fluxo de integração (Simulação) para: ${avaliacao.nome_cliente}`,
    )

    if (phone) {
      console.log(`[AUTOMAÇÃO - WHATSAPP] Destino: ${phone}`)

      // 1. Gatilho de PDF
      if (pdfUrl) {
        console.log(`[AUTOMAÇÃO - WHATSAPP] Ação 1: Enviar PDF via WhatsApp API -> URL: ${pdfUrl}`)
      } else {
        console.log(
          `[AUTOMAÇÃO - WHATSAPP] Ação 1: PDF não cadastrado, fluxo de envio de documento pulado.`,
        )
      }

      // 2. Fila de Envios de Vídeos
      console.log(`[AUTOMAÇÃO - WHATSAPP] Ação 2: Preparando fila de envio de vídeos agendados.`)

      const { data: configs } = await supabaseClient
        .from('video_automations_config')
        .select('dias_trigger')
        .eq('is_active', true)

      if (configs && configs.length > 0) {
        const inserts = configs.map((c) => ({
          avaliacao_id: avaliacaoId,
          dias_apos_avaliacao: c.dias_trigger,
          status: 'pendente',
        }))

        for (const item of inserts) {
          const { error: insertErr } = await supabaseClient.from('videos_agendados').insert(item)

          if (!insertErr) {
            console.log(
              `[AUTOMAÇÃO - WHATSAPP] Video scheduled for ${item.dias_apos_avaliacao} days.`,
            )
          }
        }
      }

      console.log(
        `[AUTOMAÇÃO - WHATSAPP] Status: Pronta para receber credenciais da API Oficial (Token / Phone ID).`,
      )
    } else {
      console.log(`[AUTOMAÇÃO - WHATSAPP] Abortando: Aluno não possui telefone cadastrado.`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Automação simulada concluída com sucesso. Infraestrutura pronta para integração real com WhatsApp Business API.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
})
