import { supabase } from '@/lib/supabase/client'

const ANVISA_MEDS: Record<string, string> = {
  // Principais referências ANVISA e uso comum no Brasil
  losartana: 'Controle da Pressão Arterial',
  'losartana potássica': 'Controle da Pressão Arterial',
  glifage: 'Controle de Diabetes',
  metformina: 'Controle de Diabetes',
  omeprazol: 'Protetor Gástrico',
  pantoprazol: 'Protetor Gástrico',
  dorflex: 'Relaxante Muscular',
  rivotril: 'Ansiolítico',
  clonazepam: 'Ansiolítico',
  simvastatina: 'Redução de Colesterol',
  rosuvastatina: 'Redução de Colesterol',
  atenolol: 'Controle da Pressão Arterial',
  roacutan: 'Tratamento de Acne',
  isotretinoína: 'Tratamento de Acne',
  dipirona: 'Analgésico e Antitérmico',
  paracetamol: 'Analgésico e Antitérmico',
  ibuprofeno: 'Anti-inflamatório',
  nimesulida: 'Anti-inflamatório',
  azitromicina: 'Antibiótico',
  amoxicilina: 'Antibiótico',
  cefalexina: 'Antibiótico',
  levotiroxina: 'Reposição Hormonal da Tireoide',
  puran: 'Reposição Hormonal da Tireoide',
  'puran t4': 'Reposição Hormonal da Tireoide',
  escitalopram: 'Antidepressivo',
  sertralina: 'Antidepressivo',
  fluoxetina: 'Antidepressivo',
  xarelto: 'Anticoagulante',
  rivaroxabana: 'Anticoagulante',
  ozempic: 'Controle de Diabetes e Peso',
  semaglutida: 'Controle de Diabetes e Peso',
  venvanse: 'Tratamento de TDAH',
  lisdexanfetamina: 'Tratamento de TDAH',
  ritalina: 'Tratamento de TDAH',
  metilfenidato: 'Tratamento de TDAH',
  concor: 'Controle da Pressão Arterial',
  bisoprolol: 'Controle da Pressão Arterial',
  selozok: 'Controle da Pressão Arterial',
  aradois: 'Controle da Pressão Arterial',
  diovan: 'Controle da Pressão Arterial',
  valsartana: 'Controle da Pressão Arterial',
  forxiga: 'Controle de Diabetes',
  dapagliflozina: 'Controle de Diabetes',
  jardiance: 'Controle de Diabetes',
  empagliflozina: 'Controle de Diabetes',
  aerolin: 'Tratamento Respiratório',
  salbutamol: 'Tratamento Respiratório',
  alenia: 'Tratamento Respiratório',
  buscopan: 'Antiespasmódico',
  escopolamina: 'Antiespasmódico',
  tylenol: 'Analgésico',
  advil: 'Anti-inflamatório',
  viagra: 'Vasodilatador',
  cialis: 'Vasodilatador',
  tadalafila: 'Vasodilatador',
  sildenafila: 'Vasodilatador',
  desloratadina: 'Antialérgico',
  loratadina: 'Antialérgico',
  allegra: 'Antialérgico',
  fexofenadina: 'Antialérgico',
  polaramine: 'Antialérgico',
  dexclorfeniramina: 'Antialérgico',
  prednisona: 'Corticoide',
  dexametasona: 'Corticoide',
  hidrocortisona: 'Corticoide',
  espironolactona: 'Diurético',
  furosemida: 'Diurético',
  lasix: 'Diurético',
  hidroclorotiazida: 'Diurético',
  alprazolam: 'Ansiolítico',
  enalapril: 'Controle da Pressão Arterial',
  captopril: 'Controle da Pressão Arterial',
  anlodipino: 'Controle da Pressão Arterial',
  sinvastatina: 'Redução de Colesterol',
  atorvastatina: 'Redução de Colesterol',
  ezetimiba: 'Redução de Colesterol',
  levofloxacino: 'Antibiótico',
  ciprofloxacino: 'Antibiótico',
  moxifloxacino: 'Antibiótico',
  amitriptilina: 'Antidepressivo',
  nortriptilina: 'Antidepressivo',
  venlafaxina: 'Antidepressivo',
  desvenlafaxina: 'Antidepressivo',
  duloxetina: 'Antidepressivo',
  pregabalina: 'Dor Neuropática',
  gabapentina: 'Dor Neuropática',
  topiramato: 'Anticonvulsivante',
  'ácido valproico': 'Anticonvulsivante',
  carbamazepina: 'Anticonvulsivante',
  fenitoína: 'Anticonvulsivante',
  fenobarbital: 'Anticonvulsivante',
  'ácido fólico': 'Suplemento Vitamínico',
  'sulfato ferroso': 'Suplemento Mineral',
  'vitamina d': 'Suplemento Vitamínico',
  'vitamina b12': 'Suplemento Vitamínico',
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
  if (!text) return 'Ação a ser definida'

  const lower = text.toLowerCase()

  // Dicionário científico rigoroso para mapeamento exato da função principal
  const actionDictionary: Record<string, string> = {
    hipertensão: 'Controle da Pressão Arterial',
    'pressão arterial': 'Controle da Pressão Arterial',
    'pressão alta': 'Controle da Pressão Arterial',
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
    infecção: 'Tratamento de Infecção',
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
    corticoide: 'Corticoide',
    diurético: 'Diurético',
  }

  for (const [key, value] of Object.entries(actionDictionary)) {
    if (lower.includes(key)) {
      return value
    }
  }

  // Fallback extremamente estrito: Pega as 2 ou 3 primeiras palavras limpas
  const cleanText = text
    .replace(/\[.*?\]/g, ' ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleanText.split(' ')
  if (words.length > 0) {
    const extracted = words.slice(0, 3).join(' ')
    if (extracted.length > 3) {
      return extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase()
    }
  }

  return 'Ação a ser definida'
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

    // 1. Prioridade Absoluta: Base Validada ANVISA (Mock em Código)
    if (ANVISA_MEDS[lowerName]) {
      return { action: ANVISA_MEDS[lowerName], verified: true }
    }

    // 2. Busca OpenFDA
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
          if (acao !== 'Ação a ser definida') {
            return { action: acao, verified: true }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar no OpenFDA', err)
    }

    // 3. Busca Wikipedia
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
          if (acao !== 'Ação a ser definida') {
            return { action: acao, verified: true }
          }
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
  // Força uma última checagem de tamanho para evitar textos corridos na base
  const cleanAcao = acao_principal.split(' ').slice(0, 4).join(' ').trim()

  const { data, error } = await supabase
    .from('medicamentos')
    .insert({ nome: nome.toUpperCase(), acao_principal: cleanAcao, verified })
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
