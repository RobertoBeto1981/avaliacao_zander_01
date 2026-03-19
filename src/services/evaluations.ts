import { supabase } from '@/lib/supabase/client'

export const createEvaluation = async (data: any) => {
  const { data: result, error } = await supabase.from('evaluations').insert(data).select().single()
  if (error) throw error
  return result
}

export const getEvaluations = async () => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
