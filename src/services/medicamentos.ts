import { supabase } from '@/lib/supabase/client'

export const searchMedicamentos = async (query: string) => {
  // Remove commas to prevent breaking the .or() syntax
  const safeQuery = query.replace(/,/g, '')

  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .or(`nome.ilike.%${safeQuery}%,acao_principal.ilike.%${safeQuery}%`)
    .limit(15)

  if (error) {
    console.error('Error fetching medicamentos:', error)
    return []
  }

  return data || []
}
