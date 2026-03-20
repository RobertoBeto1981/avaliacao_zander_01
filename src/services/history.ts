import { supabase } from '@/lib/supabase/client'

export const getAvaliacaoHistory = async (avaliacaoId: string) => {
  const { data, error } = await supabase
    .from('avaliacao_history' as any) // Using any since we added the table manually via migration and it's not in types.ts yet
    .select(
      `
      id,
      created_at,
      action_type,
      description,
      metadata,
      user:users!avaliacao_history_user_id_fkey(nome)
    `,
    )
    .eq('avaliacao_id', avaliacaoId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
