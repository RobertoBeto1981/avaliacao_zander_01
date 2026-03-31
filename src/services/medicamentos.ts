import { supabase } from '@/lib/supabase/client'

const COMMON_MEDS: Record<string, string> = {
  glifage: 'Controle de diabetes',
  losartana: 'Controle de pressão alta',
  omeprazol: 'Protetor gástrico',
  dorflex: 'Relaxante muscular',
  rivotril: 'Ansiolítico / Sedativo',
  simvastatina: 'Controle de colesterol',
  pantoprazol: 'Protetor gástrico',
  atenolol: 'Controle de pressão alta',
  metformina: 'Controle de diabetes',
  roacutan: 'Tratamento de acne severa',
  dipirona: 'Analgésico e antitérmico',
  paracetamol: 'Analgésico e antitérmico',
  ibuprofeno: 'Anti-inflamatório e analgésico',
  azitromicina: 'Antibiótico',
  amoxicilina: 'Antibiótico',
  levotiroxina: 'Reposição hormonal da tireoide',
  puran: 'Reposição hormonal da tireoide',
  escitalopram: 'Antidepressivo',
  sertralina: 'Antidepressivo',
  fluoxetina: 'Antidepressivo',
  xarelto: 'Anticoagulante',
  ozempic: 'Controle de diabetes e peso',
  venvanse: 'Tratamento de TDAH',
  ritalina: 'Tratamento de TDAH',
}

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

  const lower = text.toLowerCase()

  // Dicionário científico rigoroso para mapeamento exato
  const actionDictionary: Record<string, string> = {
    hipertensão: 'Controle da Pressão Arterial',
    'pressão arterial': 'Controle da Pressão Arterial',
    diabetes: 'Controle de Diabetes',
    glicemia: 'Controle de Diabetes',
    colesterol: 'Redução de Colesterol',
    úlcera: 'Protetor Gástrico',
    gástric: 'Protetor Gástrico',
    refluxo: 'Protetor Gástrico',
    'anti-inflamatório': 'Anti-inflamatório',
    antiinflamatório: 'Anti-inflamatório',
    antibiótico: 'Antibiótico',
    bacteri: 'Antibiótico',
    analgésico: 'Analgésico',
    dor: 'Analgésico',
    depressão: 'Antidepressivo',
    ansiedade: 'Ansiolítico',
    ansiolítico: 'Ansiolítico',
    tireoide: 'Reposição Hormonal da Tireoide',
    asma: 'Tratamento Respiratório',
    broncodilatador: 'Tratamento Respiratório',
    alergia: 'Antialérgico',
    antialérgico: 'Antialérgico',
    coágulo: 'Anticoagulante',
    trombose: 'Anticoagulante',
    anticoagulante: 'Anticoagulante',
    'relaxante muscular': 'Relaxante Muscular',
    múscul: 'Relaxante Muscular',
    convuls: 'Anticonvulsivante',
    epilepsia: 'Anticonvulsivante',
    tdah: 'Tratamento de TDAH',
    obesidade: 'Auxiliar na Perda de Peso',
    emagrecimento: 'Auxiliar na Perda de Peso',
  }

  for (const [key, value] of Object.entries(actionDictionary)) {
    if (lower.includes(key)) {
      return value
    }
  }

  // Fallback: extrai a primeira frase curta
  let cleanText = text
    .replace(/\[.*?\]/g, ' ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const markers = [
    'indicado para o tratamento de ',
    'indicada para o tratamento de ',
    'utilizado no tratamento de ',
    'utilizado para ',
    'serve para ',
    'tratamento de ',
    'controle de ',
    'alívio de ',
    'prevenção de ',
    'ação ',
  ]

  let extracted = ''
  for (const marker of markers) {
    const idx = cleanText.toLowerCase().indexOf(marker)
    if (idx !== -1) {
      extracted = cleanText
        .substring(idx + marker.length)
        .split(/[,.;:]/)[0]
        .trim()
      break
    }
  }

  if (!extracted) {
    extracted = cleanText.split('.')[0].trim()
  }

  // Limite estrito a 5 palavras para manter no formato resumido e limpo
  const words = extracted.split(' ')
  if (words.length > 5) {
    extracted = words.slice(0, 5).join(' ')
  }

  if (extracted.length < 3) return 'Ação não identificada'

  return extracted.charAt(0).toUpperCase() + extracted.slice(1)
}

export const searchMedicamentos = async (query: string) => {
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
    const lowerName = nome.toLowerCase().trim()
    if (COMMON_MEDS[lowerName]) {
      return { action: COMMON_MEDS[lowerName], verified: true }
    }

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
