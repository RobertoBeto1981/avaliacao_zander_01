import { supabase } from '@/lib/supabase/client'

export const sendWhatsAppLinks = async (avaliacaoId: string) => {
  const { data, error } = await supabase.functions.invoke('enviar-whatsapp-links', {
    body: { avaliacaoId },
  })

  if (error) {
    throw new Error(error.message || 'Erro de comunicação com o servidor')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}
