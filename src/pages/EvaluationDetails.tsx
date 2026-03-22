import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Printer,
  ChevronLeft,
  Dumbbell,
  User,
  Activity,
  CalendarDays,
  HeartPulse,
  Link as LinkIcon,
  MessageSquareQuote,
} from 'lucide-react'
import { getEvaluationById } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const InfoField = ({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'flex flex-col border-b border-border/40 print:border-gray-200 pb-1.5 print:pb-1',
      className,
    )}
  >
    <span className="text-[10px] print:text-[8px] font-bold uppercase tracking-wider text-muted-foreground print:text-gray-500 mb-0.5 print:mb-0">
      {label}
    </span>
    <span className="text-sm print:text-[11px] font-medium text-foreground print:text-black leading-tight">
      {value || '-'}
    </span>
  </div>
)

const LinkField = ({ label, url }: { label: string; url?: string | null }) => {
  if (!url) return null
  return (
    <div className="flex flex-col border-b border-border/40 print:border-gray-200 pb-1.5 print:pb-1 col-span-1 md:col-span-2 lg:col-span-3 print:col-span-3">
      <span className="text-[10px] print:text-[8px] font-bold uppercase tracking-wider text-muted-foreground print:text-gray-500 mb-0.5 print:mb-0">
        {label}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm print:text-[10px] font-medium text-blue-600 hover:underline print:text-blue-800 break-all leading-tight"
      >
        {url}
      </a>
    </div>
  )
}

const Section = ({ title, icon: Icon, children }: any) => (
  <section className="mb-8 print:mb-4 print-break-inside-avoid">
    <div className="flex items-center gap-2 mb-4 print:mb-2 border-b-2 border-primary/20 pb-2 print:pb-1 print:border-gray-300">
      <Icon className="w-5 h-5 print:w-4 print:h-4 text-primary print:text-gray-600" />
      <h3 className="text-lg print:text-sm font-bold uppercase text-primary print:text-black tracking-tight">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-4 print:gap-x-4 print:gap-y-2">
      {children}
    </div>
  </section>
)

export default function EvaluationDetails() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const userRole = profile?.role

  useEffect(() => {
    if (id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        setData(null)
        setLoading(false)
        return
      }

      getEvaluationById(id)
        .then((res) => {
          setData(res)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setData(null)
          setLoading(false)
        })
    }
  }, [id])

  const safeDate = (d?: string) => (d ? format(new Date(d), 'dd/MM/yyyy') : '-')
  const safeArray = (arr: any) => (Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : '-')

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>
  if (!data) return <div className="p-8 text-center text-destructive">Avaliação não encontrada</div>

  const r = data.respostas || {}

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild>
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        {userRole !== 'professor' && (
          <Button onClick={() => window.print()} className="font-bold">
            <Printer className="mr-2 h-4 w-4" /> Exportar em PDF
          </Button>
        )}
      </div>

      <Card className="border-border/50 print:border-none print:shadow-none bg-white text-black">
        <CardContent className="p-8 md:p-10 print:p-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-primary pb-6 mb-8 print:pb-3 print:mb-4 gap-4 print:gap-2">
            <div className="flex items-center gap-4 print:gap-3">
              <div className="bg-primary p-3 rounded-xl print:bg-transparent print:border-2 print:border-primary print:p-1.5">
                <Dumbbell className="w-10 h-10 print:w-6 print:h-6 text-white print:text-primary" />
              </div>
              <div>
                <h1 className="text-3xl print:text-xl font-black uppercase tracking-tighter text-[#1d1d1b]">
                  ZANDER Academia
                </h1>
                <p className="text-lg print:text-xs text-muted-foreground print:text-gray-600 font-medium">
                  Ficha de Avaliação Física e Anamnese
                </p>
              </div>
            </div>
            <div className="text-right text-sm print:text-xs bg-muted/30 p-3 rounded-lg print:bg-transparent print:p-0">
              <p className="text-muted-foreground print:text-gray-500 uppercase text-[10px] print:text-[8px] font-bold tracking-wider">
                Emitido em
              </p>
              <p className="font-bold text-foreground print:text-black">
                {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>

          <div className="space-y-2 print:space-y-0">
            <Section title="Identificação do Cliente" icon={User}>
              <InfoField
                label="Nome Completo"
                value={data.nome_cliente}
                className="md:col-span-2 print:col-span-2"
              />
              <InfoField label="ID EVO" value={data.evo_id} />
              <InfoField label="Telefone" value={data.telefone_cliente} />
              <InfoField label="Data Avaliação" value={safeDate(data.data_avaliacao)} />
              <InfoField label="Data Reavaliação" value={safeDate(data.data_reavaliacao)} />
              <InfoField label="Período de Treino" value={data.periodo_treino} />
              <InfoField label="Avaliador Responsável" value={data.avaliador?.nome} />
              <InfoField label="Professor Designado" value={data.professor?.nome} />
              <InfoField
                label="Objetivos Iniciais"
                value={safeArray(data.objectives)}
                className="md:col-span-2 lg:col-span-3 print:col-span-3 bg-primary/5 print:bg-transparent p-2 rounded print:p-0"
              />
            </Section>

            <Section title="Histórico de Treinamento" icon={Activity}>
              <InfoField label="Principal Objetivo" value={r.main_objective} />
              <InfoField label="Frequência Semanal" value={r.training_frequency} />
              <InfoField label="Nível Atual" value={r.activity_level} />
              <InfoField label="Tempo de Prática" value={r.practice_time} />
              <InfoField label="Data Alvo" value={safeDate(r.target_date)} />
              <InfoField
                label="Modalidades Praticadas"
                value={r.modalities}
                className="md:col-span-2 lg:col-span-3 print:col-span-3"
              />
            </Section>

            <Section title="Estilo de Vida Atual" icon={CalendarDays}>
              <InfoField label="Refeições/dia" value={r.meals_per_day} />
              <InfoField label="Horas de Sono" value={r.sleep_hours} />
              <InfoField label="Consumo de Álcool" value={r.alcohol} />

              <InfoField label="Acomp. Nutricional" value={r.nutritional_status?.choice} />
              {r.nutritional_status?.reason && (
                <InfoField
                  label="Motivo S/ Acompanhamento"
                  value={r.nutritional_status?.reason}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField label="Uso de Suplementos" value={r.supplements?.choice ? 'Sim' : 'Não'} />
              {r.supplements?.choice && (
                <InfoField
                  label="Quais suplementos"
                  value={r.supplements?.list}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField label="Tabagista" value={r.smoking?.choice ? 'Sim' : 'Não'} />
              {r.smoking?.choice && (
                <InfoField
                  label="Quantidade/dia"
                  value={r.smoking?.amount}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField
                label="Intolerâncias Alimentares"
                value={safeArray(r.intolerances?.choices)}
                className="md:col-span-3 print:col-span-3"
              />
              {r.intolerances?.list && (
                <InfoField
                  label="Outras Intolerâncias"
                  value={r.intolerances?.list}
                  className="md:col-span-3 print:col-span-3"
                />
              )}
            </Section>

            <Section title="Histórico Médico e Saúde" icon={HeartPulse}>
              <InfoField label="Diabetes" value={r.diabetes ? 'Sim' : 'Não'} />
              <InfoField label="Hipertensão" value={r.hypertension ? 'Sim' : 'Não'} />
              <InfoField
                label="Patologia Respiratória"
                value={r.respiratory_pathology ? 'Sim' : 'Não'}
              />

              <InfoField label="Exames Alterados" value={r.health_exams?.choice} />
              {r.health_exams?.notes && (
                <InfoField
                  label="Obs. Exames"
                  value={r.health_exams?.notes}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField
                label="Patologia Cardiovascular"
                value={r.cardio_pathology?.choice ? 'Sim' : 'Não'}
              />
              {r.cardio_pathology?.choice && (
                <InfoField
                  label="Qual"
                  value={r.cardio_pathology?.list}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField
                label="Uso de Remédios Contínuos"
                value={r.medications?.choice ? 'Sim' : 'Não'}
                className="bg-orange-50 print:bg-transparent"
              />
              {r.medications?.choice && (
                <InfoField
                  label="Lista de Medicamentos / Ações"
                  value={r.medications?.list}
                  className="md:col-span-2 print:col-span-2 bg-orange-50 print:bg-transparent"
                />
              )}

              <InfoField label="Alergias" value={r.allergies?.choice ? 'Sim' : 'Não'} />
              {r.allergies?.choice && (
                <InfoField
                  label="Quais alergias"
                  value={r.allergies?.list}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField label="Cirurgias Prévias" value={r.surgeries?.choice ? 'Sim' : 'Não'} />
              {r.surgeries?.choice && (
                <InfoField
                  label="Quais cirurgias"
                  value={r.surgeries?.list}
                  className="md:col-span-2 print:col-span-2"
                />
              )}

              <InfoField
                label="Dores Musculares/Articulares"
                value={r.pains?.choice ? 'Sim' : 'Não'}
              />
              {r.pains?.choice && (
                <InfoField
                  label="Observação da Dor"
                  value={r.pains?.observation}
                  className="md:col-span-2 print:col-span-2 text-red-600 print:text-red-800"
                />
              )}

              <InfoField
                label="Plano de Saúde"
                value={
                  r.health_insurance?.choice === 'OUTRO'
                    ? r.health_insurance?.other
                    : r.health_insurance?.choice
                }
              />
              <InfoField
                label="Contato de Emergência"
                value={r.emergency_contact}
                className="md:col-span-2 print:col-span-2"
              />
            </Section>

            <Section title="Preferências de Treino" icon={Dumbbell}>
              <InfoField
                label="Dias Disponíveis"
                value={safeArray(r.available_days)}
                className="md:col-span-2 print:col-span-2"
              />
              <InfoField label="Tempo por Sessão" value={r.session_duration} />
              <InfoField
                label="Como soube da academia?"
                value={r.discovery_source}
                className="md:col-span-3 print:col-span-3"
              />
              <InfoField
                label="Gosta de Treinar"
                value={safeArray(r.enjoys_training)}
                className="md:col-span-3 print:col-span-3"
              />
              <InfoField
                label="Gostaria de Melhorar"
                value={safeArray(r.dislikes_looking_at)}
                className="md:col-span-3 print:col-span-3"
              />
              <InfoField
                label="NÃO GOSTA de Treinar"
                value={safeArray(r.dislikes_training)}
                className="md:col-span-3 print:col-span-3"
              />
              <InfoField
                label="Exercícios Favoritos"
                value={r.favorite_exercises}
                className="md:col-span-3 print:col-span-3"
              />
              <InfoField
                label="Exercícios que não gosta"
                value={r.hated_exercises}
                className="md:col-span-3 print:col-span-3"
              />
            </Section>

            {r.final_observations && (
              <Section title="Observações Finais" icon={MessageSquareQuote}>
                <InfoField
                  label="Anotações do Avaliador"
                  value={r.final_observations}
                  className="md:col-span-3 print:col-span-3 whitespace-pre-wrap"
                />
              </Section>
            )}

            {data.links_avaliacao && data.links_avaliacao.length > 0 && (
              <Section title="Anexos e Links" icon={LinkIcon}>
                <LinkField label="Anamnese Completa" url={data.links_avaliacao[0].anamnese_url} />
                <LinkField
                  label="Mapeamento de Sintomas"
                  url={data.links_avaliacao[0].mapeamento_sintomas_url}
                />
                <LinkField
                  label="Mapeamento da Dor"
                  url={data.links_avaliacao[0].mapeamento_dor_url}
                />
                <LinkField label="Bioimpedância (BIA)" url={data.links_avaliacao[0].bia_url} />
                <LinkField label="My Score" url={data.links_avaliacao[0].my_score_url} />
                <LinkField
                  label="Relatório PDF (Externo)"
                  url={data.links_avaliacao[0].relatorio_pdf_url}
                />
              </Section>
            )}
          </div>

          {userRole !== 'professor' && (
            <div className="mt-12 pt-8 border-t border-dashed border-gray-300 text-center no-print">
              <p className="text-sm text-muted-foreground mb-4">
                Fim do relatório gerado. Utilize o botão acima para exportar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
