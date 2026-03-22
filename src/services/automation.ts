import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export const triggerPostSaveAutomation = async (avaliacaoId: string) => {
  try {
    console.log(`[Automação] Disparando webhook pós-salvamento (Avaliação: ${avaliacaoId})...`)
    const { data, error } = await supabase.functions.invoke('process-evaluation-automations', {
      body: { avaliacaoId },
    })

    if (error) {
      console.error('[Automação] Erro no servidor:', error)
      return null
    }

    console.log('[Automação] Estrutura acionada com sucesso:', data)

    // Notifica o usuário que a automação está preparando o envio
    toast({
      title: 'Automações Enfileiradas',
      description: 'Envio de PDF e preparação de vídeos via WhatsApp iniciados em background.',
    })

    return data
  } catch (err) {
    console.error('[Automação] Falha ao acionar automação:', err)
    return null
  }
}
