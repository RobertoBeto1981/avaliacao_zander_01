import { supabase } from '@/lib/supabase/client'

const translateToPT = async (text: string): Promise<string> => {
  try {
    // Using MyMemory Translation API (Free, no auth required for low volume)
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
  return text // Fallback to original English if translation fails
}

const extractShortAction = (text: string): string => {
  if (!text) return ''

  // Limpeza inicial: remove [EPC], [MoA] etc que vêm da FDA
  let cleanText = text.replace(/\[.*?\]/g, '').trim()

  // Remove quebras de linha
  cleanText = cleanText.replace(/\n/g, ' ')

  // Se for uma frase muito curta, provável que seja uma classe (ex: Antiflatulento)
  if (cleanText.length <= 40 && !cleanText.includes('.')) {
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1)
  }

  const lower = cleanText.toLowerCase()

  // Expressões comuns que antecedem a ação/indicação do medicamento
  const markers = [
    'indicado para ',
    'indicada para ',
    'utilizado no tratamento de ',
    'utilizado no tratamento da ',
    'utilizado para ',
    'usado para ',
    'serve para ',
    'atua inibindo ',
    'atua reduzindo ',
    'atua no combate ',
    'atua como ',
    'tratamento de ',
    'tratamento da ',
    'controle de ',
    'controle da ',
    'alívio de ',
    'alívio da ',
    'prevenção de ',
    'prevenção da ',
  ]

  for (const marker of markers) {
    const idx = lower.indexOf(marker)
    if (idx !== -1) {
      let extracted = cleanText.substring(idx + marker.length)
      // Corta no primeiro sinal de pontuação ou conectivo que indique fim da ação primária
      extracted = extracted.split(/[,.;]/)[0]
      // Se ainda for muito longo, corta para caber bem na interface
      if (extracted.length > 50) {
        extracted = extracted.substring(0, 47).trim() + '...'
      }
      return extracted.charAt(0).toUpperCase() + extracted.slice(1)
    }
  }

  // Se não achou marcadores, pega a primeira frase e tenta resumir
  let sentence = cleanText.split('.')[0]
  if (sentence.length > 50) {
    // Tenta cortar na primeira vírgula se a frase for longa
    sentence = sentence.split(',')[0]
    if (sentence.length > 50) {
      sentence = sentence.substring(0, 47).trim() + '...'
    }
  }

  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

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

// Utilitário para fazer requisições de forma segura sem disparar erros de rede globais no ambiente de preview
// Evita "travamentos" ou telas de erro bloqueantes quando APIs retornam 404 (comum no OpenFDA)
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
        // Ignora silenciosamente erros 404 e resolve nulo para ir ao fallback
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
    // 1. Tentar OpenFDA (Base Oficial Internacional)
    try {
      const fdaData = await safeFetchJSON(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
          nome,
        )}"+openfda.generic_name:"${encodeURIComponent(nome)}"&limit=1`,
      )

      if (fdaData && fdaData.results && fdaData.results.length > 0) {
        const result = fdaData.results[0]

        // Prioriza as classes farmacêuticas (geralmente são descrições curtas e precisas)
        let rawAction = result.openfda?.pharm_class_epc?.[0] || result.openfda?.pharm_class_moa?.[0]

        // Fallback para indicação se não tiver a classe
        if (!rawAction) {
          rawAction = result.indications_and_usage?.[0] || result.purpose?.[0]
        }

        if (rawAction) {
          // Traduz a indicação do inglês para o português
          let acao = await translateToPT(rawAction)
          // Extrai apenas a ação principal de forma concisa
          acao = extractShortAction(acao)

          if (acao) return { action: acao, verified: true }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar no OpenFDA', err)
    }

    // 2. Tentar Wikipedia PT como fallback (Resultados já em Português)
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
