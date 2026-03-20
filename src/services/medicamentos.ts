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

export const learnMedicamento = async (nome: string) => {
  try {
    const res = await fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nome)}`,
    )
    if (res.ok) {
      const data = await res.json()
      // Ignora páginas de desambiguação
      if (data.extract && !data.title?.toLowerCase().includes('desambiguação')) {
        let acao = data.extract.split('.')[0]
        if (acao.length > 100) acao = acao.substring(0, 97) + '...'
        return acao
      }
    }
  } catch (err) {
    console.error('Erro ao buscar na Wikipedia', err)
  }
  return null
}

export const addMedicamento = async (nome: string, acao_principal: string) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .insert({ nome: nome.toUpperCase(), acao_principal })
    .select()
    .single()

  if (error) {
    // Retorna o existente em caso de concorrência ou conflito
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('nome', nome.toUpperCase())
        .single()
      if (existing) return existing
    }
    throw error
  }

  return data
}
