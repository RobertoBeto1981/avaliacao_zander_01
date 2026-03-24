import { supabase } from '@/lib/supabase/client'

export function calculateEvolucao(oldData: any, newData: any) {
  const evolucao: any[] = []

  // Sleep
  const sleepLevels = ['Menos de 6h', '6h', '7h', '8h', 'Mais de 8h']
  const oldSleep = sleepLevels.indexOf(oldData.sleep_hours || '')
  const newSleep = sleepLevels.indexOf(newData.sleep_hours || '')
  if (oldSleep !== -1 && newSleep !== -1 && oldSleep !== newSleep) {
    evolucao.push({
      campo: 'Tempo de Sono',
      status: newSleep > oldSleep ? 'melhorou' : 'piorou',
      de: oldData.sleep_hours,
      para: newData.sleep_hours,
    })
  }

  // Freq
  const freqLevels = ['NENHUMA', '1-2 VEZES', '3-4 VEZES', '5-6 VEZES', 'DIARIAMENTE']
  const oldFreq = freqLevels.indexOf(oldData.training_frequency || '')
  const newFreq = freqLevels.indexOf(newData.training_frequency || '')
  if (oldFreq !== -1 && newFreq !== -1 && oldFreq !== newFreq) {
    evolucao.push({
      campo: 'Frequência de Treino',
      status: newFreq > oldFreq ? 'melhorou' : 'piorou',
      de: oldData.training_frequency,
      para: newData.training_frequency,
    })
  }

  // Act
  const actLevels = [
    'SEDENTÁRIO',
    'DESTREINADO',
    'LEVEMENTE ATIVO',
    'MODERADAMENTE ATIVO',
    'MUITO ATIVO',
  ]
  const oldAct = actLevels.indexOf(oldData.activity_level || '')
  const newAct = actLevels.indexOf(newData.activity_level || '')
  if (oldAct !== -1 && newAct !== -1 && oldAct !== newAct) {
    evolucao.push({
      campo: 'Nível de Atividade',
      status: newAct > oldAct ? 'melhorou' : 'piorou',
      de: oldData.activity_level,
      para: newData.activity_level,
    })
  }

  // Smoke
  const oldSmoke = oldData.smoking?.choice
  const newSmoke = newData.smoking?.choice
  if (oldSmoke !== newSmoke && oldSmoke !== undefined && newSmoke !== undefined) {
    evolucao.push({
      campo: 'Tabagismo',
      status: newSmoke ? 'piorou' : 'melhorou',
      de: oldSmoke ? 'Fumante' : 'Não fumante',
      para: newSmoke ? 'Fumante' : 'Não fumante',
    })
  }

  // Meds
  const oldMeds = oldData.medications?.choice
  const newMeds = newData.medications?.choice
  if (oldMeds !== newMeds && oldMeds !== undefined && newMeds !== undefined) {
    evolucao.push({
      campo: 'Medicamentos Contínuos',
      status: newMeds ? 'piorou' : 'melhorou',
      de: oldMeds ? 'Usa' : 'Não usa',
      para: newMeds ? 'Usa' : 'Não usa',
    })
  }

  // Pain
  const oldPain = oldData.pains?.choice
  const newPain = newData.pains?.choice
  if (oldPain !== newPain && oldPain !== undefined && newPain !== undefined) {
    evolucao.push({
      campo: 'Dores Articulares/Musculares',
      status: newPain ? 'piorou' : 'melhorou',
      de: oldPain ? 'Com dores' : 'Sem dores',
      para: newPain ? 'Com dores' : 'Sem dores',
    })
  }

  // VO2 Max
  const oldVo2 = oldData.vo2_test?.vo2_max
  const newVo2 = newData.vo2_test?.vo2_max
  if (oldVo2 && newVo2 && oldVo2 !== newVo2) {
    const o = parseFloat(oldVo2)
    const n = parseFloat(newVo2)
    evolucao.push({
      campo: 'VO² Máximo',
      status: n > o ? 'melhorou' : n < o ? 'piorou' : 'manteve',
      de: `${oldVo2} ml/kg/min`,
      para: `${newVo2} ml/kg/min`,
    })
  }

  // VO2 Classification
  const oldClass = oldData.vo2_test?.classification
  const newClass = newData.vo2_test?.classification
  if (oldClass && newClass && oldClass !== newClass) {
    const classLevels = ['Fraco', 'Regular', 'Bom', 'Excelente', 'Superior']
    const oIdx = classLevels.indexOf(oldClass)
    const nIdx = classLevels.indexOf(newClass)
    let status = 'manteve'
    if (oIdx !== -1 && nIdx !== -1) {
      status = nIdx > oIdx ? 'melhorou' : nIdx < oIdx ? 'piorou' : 'manteve'
    }
    evolucao.push({
      campo: 'Classificação VO²',
      status: status,
      de: oldClass,
      para: newClass,
    })
  }

  return evolucao
}

export const createReavaliacao = async (
  avaliacaoId: string,
  respostasNovas: any,
  evolucao: any,
  dataReavaliacao: string,
) => {
  const { data, error } = await supabase
    .from('reavaliacoes')
    .insert({
      avaliacao_original_id: avaliacaoId,
      data_reavaliacao: dataReavaliacao,
      respostas_novas: respostasNovas,
      evolucao: evolucao,
    })
    .select()
    .single()

  if (error) throw error

  // Atualiza as datas e respostas da avaliação original
  const newReavDate = new Date(dataReavaliacao + 'T12:00:00')
  newReavDate.setDate(newReavDate.getDate() + 90)
  const nextReavDateStr = newReavDate.toISOString().split('T')[0]

  const { objectives, periodo_treino, client_links, ...restRespostas } = respostasNovas

  await supabase
    .from('avaliacoes')
    .update({
      data_avaliacao: dataReavaliacao,
      data_reavaliacao: nextReavDateStr,
      objectives: objectives,
      periodo_treino: periodo_treino,
      respostas: restRespostas,
    })
    .eq('id', avaliacaoId)

  if (client_links) {
    await supabase
      .from('links_avaliacao')
      .update({
        mapeamento_sintomas_url: client_links.symptoms,
        mapeamento_dor_url: client_links.pain,
        bia_url: client_links.bia,
        my_score_url: client_links.myscore,
      })
      .eq('avaliacao_id', avaliacaoId)
  }

  window.dispatchEvent(new CustomEvent('avaliacao_updated'))
  return data
}

export const getReavaliacoesByAvaliacao = async (avaliacaoId: string) => {
  const { data, error } = await supabase
    .from('reavaliacoes')
    .select('*')
    .eq('avaliacao_original_id', avaliacaoId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const getReavaliacaoById = async (id: string) => {
  const { data, error } = await supabase
    .from('reavaliacoes')
    .select(
      '*, avaliacao:avaliacao_original_id (nome_cliente, telefone_cliente, evo_id, professor_id, avaliador_id)',
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
