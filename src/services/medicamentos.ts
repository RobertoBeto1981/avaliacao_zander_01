import { supabase } from '@/lib/supabase/client'

const translateToPT = async (text: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-br`,
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText
      }
    }
  } catch (err) {
    console.error('Erro ao traduzir texto:', err)
  }
  return text
}

const extractShortAction = (text: string): string => {
  if (!text) return ''

  // Limpeza inicial: remove referências e parênteses
  let cleanText = text.replace(/\[.*?\]/g, ' ').trim()
  cleanText = cleanText.replace(/\(.*?\)/g, ' ')
  // Remove quebras de linha e excesso de espaços
  cleanText = cleanText.replace(/\n/g, ' ')
  cleanText = cleanText.replace(/\s+/g, ' ').trim()

  // Se já for bem curto e objetivo
  if (cleanText.length <= 40 && !cleanText.includes('.')) {
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1)
  }

  const lower = cleanText.toLowerCase()

  // Marcadores ordenados do mais específico/longo para o mais genérico
  const markers = [
    'indicado para o tratamento de ',
    'indicada para o tratamento de ',
    'indicado para o tratamento do ',
    'indicada para o tratamento do ',
    'indicado para o tratamento da ',
    'indicada para o tratamento da ',
    'indicados para o tratamento de ',
    'indicados para o tratamento do ',
    'indicados para o tratamento da ',
    'utilizado no tratamento de ',
    'utilizado no tratamento da ',
    'utilizado no tratamento do ',
    'utilizada no tratamento de ',
    'utilizada no tratamento da ',
    'utilizada no tratamento do ',
    'usado no tratamento de ',
    'usada no tratamento de ',
    'usado para o tratamento de ',
    'usada para o tratamento de ',
    'indicado para o ',
    'indicada para o ',
    'indicado para a ',
    'indicada para a ',
    'indicados para ',
    'indicadas para ',
    'indicado para ',
    'indicada para ',
    'utilizado para ',
    'utilizada para ',
    'usado para ',
    'usada para ',
    'serve para ',
    'atua inibindo ',
    'atua reduzindo ',
    'atua no combate ',
    'atua como ',
    'tratamento de ',
    'tratamento da ',
    'tratamento do ',
    'controle de ',
    'controle da ',
    'controle do ',
    'alívio de ',
    'alívio da ',
    'alívio do ',
    'prevenção de ',
    'prevenção da ',
    'prevenção do ',
    'é um medicamento da classe dos ',
    'é um medicamento da classe das ',
    'é uma medicação da classe dos ',
    'é uma medicação da classe das ',
    'pertence à classe dos ',
    'pertence à classe das ',
    'pertence a classe dos ',
    'pertence a classe das ',
    'pertence à família dos ',
    'pertence à família das ',
    'é um antidepressivo ',
    'é um anti-inflamatório ',
    'é um antibiótico ',
    'é um analgésico ',
    'é um ',
    'é uma ',
    'são um ',
    'são uma ',
    'ação ',
  ]

  for (const marker of markers) {
    const idx = lower.indexOf(marker)
    if (idx !== -1) {
      let extracted = cleanText.substring(idx + marker.length)

      // Corta no primeiro sinal de pontuação para evitar parágrafos longos
      extracted = extracted.split(/[,.;:]/)[0].trim()

      const cleanExtracted = extracted.toLowerCase()
      // Pula caso a extração resulte apenas em palavras muito vagas
      if (
        !extracted ||
        cleanExtracted === 'medicamento' ||
        cleanExtracted === 'fármaco' ||
        cleanExtracted === 'remédio'
      ) {
        continue
      }

      // Se ainda ficou longo, tenta cortar em conectivos
      if (extracted.length > 50) {
        const conectivos = [' e ', ' que ', ' o qual ', ' a qual ', ' para ']
        for (const con of conectivos) {
          const cIdx = extracted.toLowerCase().indexOf(con)
          if (cIdx > 10) {
            extracted = extracted.substring(0, cIdx).trim()
            break
          }
        }
      }

      // Limite forçado para garantir que não será um "resumo"
      if (extracted.length > 60) {
        extracted = extracted.substring(0, 57).trim() + '...'
      }

      // Recoloca o prefixo da classe se o marcador o absorveu
      if (marker === 'é um antidepressivo ') extracted = 'Antidepressivo ' + extracted
      else if (marker === 'é um anti-inflamatório ') extracted = 'Anti-inflamatório ' + extracted
      else if (marker === 'é um antibiótico ') extracted = 'Antibiótico ' + extracted
      else if (marker === 'é um analgésico ') extracted = 'Analgésico ' + extracted

      return extracted.charAt(0).toUpperCase() + extracted.slice(1)
    }
  }

  // Fallback agressivo: Pega a primeira frase
  let sentence = cleanText.split('.')[0]

  if (sentence.length > 60) {
    sentence = sentence.split(',')[0]
    if (sentence.length > 60) {
      const conectivos = [' e ', ' que ', ' o qual ', ' a qual ', ' para ']
      for (const con of conectivos) {
        const cIdx = sentence.toLowerCase().indexOf(con)
        if (cIdx > 15) {
          sentence = sentence.substring(0, cIdx).trim()
          break
        }
      }
    }
  }

  // Limite forçado final
  if (sentence.length > 60) {
    sentence = sentence.substring(0, 57).trim() + '...'
  }

  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

export const searchMedicamentos = async (query: string) => {
  // Remove vírgulas para não quebrar a sintaxe do Supabase
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

// Fetch protegido para evitar bloqueios de 404 em APIs externas
const safeFetchJSON = (url: string): Promise<any> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch (e) {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }
    xhr.onerror = () => resolve(null)
    xhr.send()
  })
}

export const learnMedicamento = async (
  nome: string,
): Promise<{ action: string; verified: boolean } | null> => {
  try {
    // 1. Tentar OpenFDA
    try {
      const fdaData = await safeFetchJSON(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
          nome,
        )}"+openfda.generic_name:"${encodeURIComponent(nome)}"&limit=1`,
      )

      if (fdaData && fdaData.results && fdaData.results.length > 0) {
        const result = fdaData.results[0]

        let rawAction = result.openfda?.pharm_class_epc?.[0] || result.openfda?.pharm_class_moa?.[0]

        if (!rawAction) {
          rawAction = result.indications_and_usage?.[0] || result.purpose?.[0]
        }

        if (rawAction) {
          let acao = await translateToPT(rawAction)
          acao = extractShortAction(acao)
          if (acao) return { action: acao, verified: true }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar no OpenFDA', err)
    }

    // 2. Tentar Wikipedia PT como fallback
    try {
      const searchData = await safeFetchJSON(
        `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          nome,
        )}&utf8=&format=json&origin=*`,
      )

      if (searchData && searchData.query?.search && searchData.query.search.length > 0) {
        const title = searchData.query.search[0].title
        const wikiData = await safeFetchJSON(
          `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        )

        if (
          wikiData &&
          wikiData.extract &&
          !wikiData.title?.toLowerCase().includes('desambiguação')
        ) {
          const acao = extractShortAction(wikiData.extract)
          if (acao) return { action: acao, verified: true }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar na Wikipedia', err)
    }
  } catch (err) {
    console.error('Erro geral ao aprender medicamento', err)
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
