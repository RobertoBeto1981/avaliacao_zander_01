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

export const learnMedicamento = async (
  nome: string,
): Promise<{ action: string; verified: boolean } | null> => {
  try {
    // 1. Tentar OpenFDA (Base Oficial Internacional)
    try {
      const fdaRes = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(nome)}"+openfda.generic_name:"${encodeURIComponent(nome)}"&limit=1`,
      )
      if (fdaRes.ok) {
        const fdaData = await fdaRes.json()
        if (fdaData.results && fdaData.results.length > 0) {
          const result = fdaData.results[0]
          const indication =
            result.indications_and_usage?.[0] ||
            result.purpose?.[0] ||
            result.openfda?.pharm_class_epc?.[0]

          if (indication) {
            let acao = indication.split('.')[0]
            if (acao.length > 100) acao = acao.substring(0, 97) + '...'
            return { action: acao, verified: true }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar no OpenFDA', err)
    }

    // 2. Tentar Wikipedia PT como fallback
    const searchRes = await fetch(
      `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(nome)}&utf8=&format=json&origin=*`,
    )

    if (searchRes.ok) {
      const searchData = await searchRes.json()
      if (searchData.query?.search && searchData.query.search.length > 0) {
        const title = searchData.query.search[0].title
        const res = await fetch(
          `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        )

        if (res.ok) {
          const data = await res.json()
          // Ignora páginas de desambiguação
          if (data.extract && !data.title?.toLowerCase().includes('desambiguação')) {
            let acao = data.extract.split('.')[0]
            if (acao.length > 100) acao = acao.substring(0, 97) + '...'
            return { action: acao, verified: true }
          }
        }
      }
    }
  } catch (err) {
    console.error('Erro ao buscar na Wikipedia', err)
  }
  return null
}

export const addMedicamento = async (
  nome: string,
  acao_principal: string,
  verified: boolean = false,
) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .insert({ nome: nome.toUpperCase(), acao_principal, verified })
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
