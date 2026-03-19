import { supabase } from '@/lib/supabase/client'

export const searchMedicamentos = async (query: string) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .ilike('nome', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error fetching medicamentos:', error)
    return []
  }

  return data || []
}
