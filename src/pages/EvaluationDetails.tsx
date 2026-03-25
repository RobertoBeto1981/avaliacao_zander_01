import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvaluationById } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, MessageCircle, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { format, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const formatChoiceObj = (obj: any) => {
  if (!obj) return '-'
  let res = ''
  if (obj.choice !== undefined) {
    if (typeof obj.choice === 'boolean') {
      res = obj.choice ? 'Sim' : 'Não'
    } else {
      res = obj.choice
    }
  } else if (obj.choices) {
    res = obj.choices.join(', ')
  }

  const extras = [obj.list, obj.reason, obj.amount, obj.other, obj.observation, obj.notes].filter(
    Boolean,
  )
  if (extras.length > 0) {
    res += res ? ` - ${extras.join(', ')}` : extras.join(', ')
  }
  return res || '-'
}

const formatValue = (val: any) => {
  if (val === undefined || val === null || val === '') return '-'
  if (typeof val === 'boolean') return val ? 'Sim' : 'Não'
  if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '-'
  return String(val)
}

const Section = ({ title, children, className }: any) => (
  <div
    className={cn(
      'rounded-xl border border-border bg-card text-card-foreground shadow-sm print:shadow-none print:border-border/50 break-inside-avoid',
      className,
    )}
  >
    <div className="px-6 py-4 border-b border-border/50 bg-muted/30 print:bg-transparent print:border-b-2 print:border-primary/20 print:px-2 print:py-2">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
    </div>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:px-2 print:py-4 print:gap-4">
      {children}
    </div>
  </div>
)

const PrintField = ({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) => (
  <div className={cn('flex flex-col', className)}>
    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
      {label}
    </span>
    <span className="font-medium text-sm text-foreground whitespace-pre-wrap">{value || '-'}</span>
  </div>
)

export default function EvaluationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const canSendWhatsApp = profile?.role === 'coordenador' || profile?.role === 'avaliador'

  useEffect(() => {
    if (!id) return
    getEvaluationById(id)
      .then(setData)
      .catch((err) => {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id, toast, navigate])

  const getFileName = () => {
    if (!data) return 'AVALIACAO'
    const evoId = data.evo_id || 'SEM-ID'
    const nome = data.nome_cliente?.replace(/\s+/g, '_').toUpperCase() || 'ALUNO'
    const dataFormatada = data.data_avaliacao
      ? format(new Date(data.data_avaliacao), 'dd-MM-yyyy')
      : format(new Date(data.created_at), 'dd-MM-yyyy')
    return `${evoId}_${nome}_${dataFormatada}`
  }

  const handleGeneratePDF = () => {
    const fileName = getFileName()
    const originalTitle = document.title
    document.title = fileName
    window.print()
    setTimeout(() => {
      document.title = originalTitle
      toast({ title: 'Sucesso', description: 'Relatório preparado para impressão/PDF.' })
    }, 500)
  }

  const handleSendWhatsApp = () => {
    if (!data?.telefone_cliente) {
      toast({
        title: 'Telefone indisponível',
        description: 'O cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }
    let phone = data.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const pdfUrl = data.links_avaliacao?.[0]?.relatorio_pdf_url
    const fileName = getFileName()

    let text = `Olá ${data.nome_cliente.split(' ')[0]}, segue o seu relatório de avaliação física!`
    if (pdfUrl) {
      text += `\n\nAcesse seu PDF aqui: ${pdfUrl}`
    } else {
      text += `\n\n(Por favor, anexe o arquivo gerado: ${fileName}.pdf)`
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

    if (!pdfUrl) {
      toast({
        title: 'Gerando PDF',
        description: `Lembre-se de salvar o arquivo (${fileName}.pdf) e anexá-lo na conversa!`,
      })
      setTimeout(() => {
        handleGeneratePDF()
        setTimeout(() => {
          window.open(url, '_blank')
        }, 500)
      }, 500)
    } else {
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  const r = data.respostas || {}
  const age = r.data_nascimento ? differenceInYears(new Date(), new Date(r.data_nascimento)) : null

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-4">
      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Detalhes da Avaliação
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.nome_cliente} -{' '}
              {format(new Date(data.data_avaliacao || data.created_at), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleGeneratePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          {canSendWhatsApp && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSendWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          )}
          {canSendWhatsApp && !data.is_pre_avaliacao && (
            <Button onClick={() => navigate(`/evaluation/${id}/reevaluate`)} variant="secondary">
              Nova Reavaliação
            </Button>
          )}
        </div>
      </div>

      <div className="hidden print:flex flex-col mb-8 border-b-2 border-primary/20 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-primary">
          Relatório de Avaliação Física
        </h1>
        <h2 className="text-xl font-semibold mt-1">{data.nome_cliente}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>ID EVO:</strong> {data.evo_id || 'N/A'} &bull; <strong>Data:</strong>{' '}
          {format(new Date(data.data_avaliacao || data.created_at), 'dd/MM/yyyy')}
        </p>
      </div>

      <div className="space-y-8 print:space-y-6">
        <Section title="Identificação">
          <PrintField label="Nome do Cliente" value={data.nome_cliente} />
          <PrintField label="ID EVO" value={data.evo_id} />
          <PrintField label="Telefone" value={data.telefone_cliente} />
          <PrintField label="Idade" value={age ? `${age} anos` : '-'} />
          <PrintField label="Gênero" value={r.gender} />
          <PrintField label="Período de Treino" value={data.periodo_treino} />
          <PrintField
            label="Objetivos"
            value={data.objectives?.join(', ')}
            className="md:col-span-2"
          />
        </Section>

        <Section title="Histórico de Treinamento">
          <PrintField label="Objetivo Principal" value={r.main_objective} />
          <PrintField
            label="Data Alvo"
            value={
              r.target_date ? format(new Date(r.target_date + 'T12:00:00'), 'dd/MM/yyyy') : '-'
            }
          />
          <PrintField label="Frequência Semanal Atual" value={r.training_frequency} />
          <PrintField label="Nível de Condicionamento" value={r.activity_level} />
          <PrintField label="Tempo de Prática" value={r.practice_time} />
          <PrintField label="Modalidades" value={r.modalities} />
        </Section>

        <Section title="Estilo de Vida Atual">
          <PrintField label="Refeições por Dia" value={r.meals_per_day} />
          <PrintField label="Horas de Sono" value={r.sleep_hours} />
          <PrintField label="Álcool" value={r.alcohol} />
          <PrintField
            label="Acompanhamento Nutricional"
            value={formatChoiceObj(r.nutritional_status)}
          />
          <PrintField label="Suplementos" value={formatChoiceObj(r.supplements)} />
          <PrintField label="Tabagismo" value={formatChoiceObj(r.smoking)} />
          <PrintField
            label="Intolerâncias"
            value={formatChoiceObj(r.intolerances)}
            className="md:col-span-3"
          />
        </Section>

        <Section title="Saúde e Histórico Médico">
          <PrintField
            label="Medicamentos Contínuos"
            value={formatChoiceObj(r.medications)}
            className="md:col-span-2"
          />
          <PrintField label="Alergias" value={formatChoiceObj(r.allergies)} />

          <PrintField
            label="Pressão Arterial (mmHg)"
            value={
              r.hemodynamics?.systolic_bp
                ? `${r.hemodynamics.systolic_bp} x ${r.hemodynamics.diastolic_bp}`
                : '-'
            }
          />
          <PrintField
            label="Freq. Cardíaca (bpm)"
            value={r.hemodynamics?.heart_rate ? `${r.hemodynamics.heart_rate}` : '-'}
          />
          <PrintField label="Exames Alterados" value={formatChoiceObj(r.health_exams)} />

          <PrintField label="Diabetes" value={r.diabetes ? 'Sim' : 'Não'} />
          <PrintField label="Hipertensão" value={r.hypertension ? 'Sim' : 'Não'} />
          <PrintField
            label="Patologia Respiratória"
            value={r.respiratory_pathology ? 'Sim' : 'Não'}
          />

          <PrintField
            label="Patologia Cardiovascular"
            value={formatChoiceObj(r.cardio_pathology)}
          />
          <PrintField label="Cirurgias" value={formatChoiceObj(r.surgeries)} />
          <PrintField label="Dores Articulares/Musculares" value={formatChoiceObj(r.pains)} />

          <PrintField label="Plano de Saúde" value={formatChoiceObj(r.health_insurance)} />
          <PrintField label="Contato de Emergência" value={r.emergency_contact} />
        </Section>

        <Section title="Preferências de Treino">
          <PrintField
            label="Dias Disponíveis"
            value={formatValue(r.available_days)}
            className="md:col-span-2"
          />
          <PrintField label="Duração da Sessão" value={r.session_duration} />
          <PrintField label="Como conheceu a academia?" value={r.discovery_source} />

          <div className="col-span-full border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PrintField label="Gosta de Treinar" value={formatValue(r.enjoys_training)} />
            <PrintField label="Incomoda no Espelho" value={formatValue(r.dislikes_looking_at)} />
            <PrintField label="NÃO Gosta de Treinar" value={formatValue(r.dislikes_training)} />
          </div>

          <div className="col-span-full border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PrintField label="Exercícios Favoritos" value={r.favorite_exercises} />
            <PrintField label="Exercícios Odiados" value={r.hated_exercises} />
          </div>
        </Section>

        {r.anthropometry &&
          (r.anthropometry.weight || r.anthropometry.height || r.anthropometry.chest) && (
            <Section title="Antropometria">
              <PrintField
                label="Peso"
                value={r.anthropometry.weight ? `${r.anthropometry.weight} kg` : '-'}
              />
              <PrintField
                label="Altura"
                value={r.anthropometry.height ? `${r.anthropometry.height} m` : '-'}
              />
              <PrintField
                label="Ombros"
                value={r.anthropometry.shoulders ? `${r.anthropometry.shoulders} cm` : '-'}
              />
              <PrintField
                label="Tórax"
                value={r.anthropometry.chest ? `${r.anthropometry.chest} cm` : '-'}
              />
              <PrintField
                label="Cintura"
                value={r.anthropometry.waist ? `${r.anthropometry.waist} cm` : '-'}
              />
              <PrintField
                label="Abdômen"
                value={r.anthropometry.abdomen ? `${r.anthropometry.abdomen} cm` : '-'}
              />
              <PrintField
                label="Quadril"
                value={r.anthropometry.hips ? `${r.anthropometry.hips} cm` : '-'}
              />

              <PrintField
                label="Braço Direito (Relax / Contr)"
                value={`${r.anthropometry.right_arm_relaxed || '-'} / ${r.anthropometry.right_arm_flexed || '-'} cm`}
              />
              <PrintField
                label="Braço Esquerdo (Relax / Contr)"
                value={`${r.anthropometry.left_arm_relaxed || '-'} / ${r.anthropometry.left_arm_flexed || '-'} cm`}
              />
              <PrintField
                label="Antebraço Dir / Esq"
                value={`${r.anthropometry.right_forearm || '-'} / ${r.anthropometry.left_forearm || '-'} cm`}
              />

              <PrintField
                label="Coxa Dir / Esq"
                value={`${r.anthropometry.right_thigh || '-'} / ${r.anthropometry.left_thigh || '-'} cm`}
              />
              <PrintField
                label="Panturrilha Dir / Esq"
                value={`${r.anthropometry.right_calf || '-'} / ${r.anthropometry.left_calf || '-'} cm`}
              />
            </Section>
          )}

        {r.vo2_test && r.vo2_test.enabled && (
          <Section title="Avaliação Cardiorrespiratória (VO2 Step)">
            <PrintField label="Cadência (BPM)" value={r.vo2_test.bpm} />
            <PrintField label="Batimentos em 15s" value={r.vo2_test.beats_15s} />
            <PrintField
              label="VO2 Máx Estimado"
              value={r.vo2_test.vo2_max ? `${r.vo2_test.vo2_max} ml/kg/min` : '-'}
            />
            <PrintField label="Classificação" value={r.vo2_test.classification} />
          </Section>
        )}

        <Section title="Links e Observações" className="print:block">
          {data.links_avaliacao && data.links_avaliacao.length > 0 && (
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 border-b border-border/50 pb-6 print:hidden">
              <PrintField
                label="Mapeamento de Sintomas"
                value={
                  data.links_avaliacao[0].mapeamento_sintomas_url ? (
                    <a
                      href={data.links_avaliacao[0].mapeamento_sintomas_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {data.links_avaliacao[0].mapeamento_sintomas_url}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
              <PrintField
                label="Mapeamento da Dor"
                value={
                  data.links_avaliacao[0].mapeamento_dor_url ? (
                    <a
                      href={data.links_avaliacao[0].mapeamento_dor_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {data.links_avaliacao[0].mapeamento_dor_url}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
              <PrintField
                label="BIA"
                value={
                  data.links_avaliacao[0].bia_url ? (
                    <a
                      href={data.links_avaliacao[0].bia_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {data.links_avaliacao[0].bia_url}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
              <PrintField
                label="My Score"
                value={
                  data.links_avaliacao[0].my_score_url ? (
                    <a
                      href={data.links_avaliacao[0].my_score_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {data.links_avaliacao[0].my_score_url}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </div>
          )}
          <div className="col-span-full grid grid-cols-1 gap-6">
            <PrintField label="Observações Finais do Avaliador" value={r.final_observations} />
            <PrintField label="Observações do Professor" value={r.professor_observations} />
          </div>
        </Section>
      </div>
    </div>
  )
}
