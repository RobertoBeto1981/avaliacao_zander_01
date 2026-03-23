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
  TrendingUp,
  ArrowRight,
  TrendingDown,
} from 'lucide-react'
import { getReavaliacaoById } from '@/services/reavaliacoes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

export default function ReevaluationDetails() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getReavaliacaoById(id)
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
  if (!data)
    return <div className="p-8 text-center text-destructive">Reavaliação não encontrada</div>

  const r = data.respostas_novas || {}
  const avaliacao = data.avaliacao || {}

  return (
    <div className="container mx-auto py-8 max-w-5xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
        <Button variant="outline" asChild>
          <Link to={`/evaluation/${data.avaliacao_original_id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Ficha Original
          </Link>
        </Button>
        <Button
          onClick={() => window.print()}
          className="font-bold border-green-600 bg-green-600 hover:bg-green-700 text-white"
        >
          <Printer className="mr-2 h-4 w-4" /> Gerar Relatório de Evolução
        </Button>
      </div>

      <Card className="border-border/50 print:border-none print:shadow-none bg-white text-black">
        <CardContent className="p-8 md:p-10 print:p-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-green-600 pb-6 mb-8 print:pb-3 print:mb-4 gap-4 print:gap-2">
            <div className="flex items-center gap-4 print:gap-3">
              <div className="bg-green-600 p-3 rounded-xl print:bg-transparent print:border-2 print:border-green-600 print:p-1.5">
                <TrendingUp className="w-10 h-10 print:w-6 print:h-6 text-white print:text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl print:text-xl font-black uppercase tracking-tighter text-[#1d1d1b]">
                  {avaliacao.nome_cliente || 'Cliente'}
                </h1>
                <div className="flex items-center gap-3 mt-1 print:mt-0">
                  <p className="text-lg print:text-xs text-muted-foreground print:text-gray-600 font-medium">
                    Relatório de Reavaliação e Evolução
                  </p>
                  {avaliacao.evo_id && (
                    <div className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md text-sm print:text-[10px] font-bold">
                      ID EVO: {avaliacao.evo_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm print:text-xs bg-muted/30 p-3 rounded-lg print:bg-transparent print:p-0">
              <p className="text-muted-foreground print:text-gray-500 uppercase text-[10px] print:text-[8px] font-bold tracking-wider">
                Reavaliado em
              </p>
              <p className="font-bold text-foreground print:text-black">
                {safeDate(data.data_reavaliacao)}
              </p>
            </div>
          </div>

          <div className="space-y-2 print:space-y-0">
            {data.evolucao && data.evolucao.length > 0 && (
              <Section title="Destaques de Evolução" icon={TrendingUp}>
                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.evolucao.map((ev: any, idx: number) => {
                    const isBetter = ev.status === 'melhorou'
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border',
                          isBetter
                            ? 'bg-green-50 border-green-200 text-green-900 print:bg-transparent print:border-green-300'
                            : 'bg-red-50 border-red-200 text-red-900 print:bg-transparent print:border-red-300',
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            isBetter ? 'bg-green-200/50' : 'bg-red-200/50',
                          )}
                        >
                          {isBetter ? (
                            <TrendingUp className="w-5 h-5 text-green-700" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-700" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm tracking-tight">{ev.campo}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs opacity-90 truncate">
                            <span className="truncate max-w-[120px]" title={ev.de}>
                              De: {ev.de || '-'}
                            </span>
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            <span className="font-semibold truncate max-w-[120px]" title={ev.para}>
                              Para: {ev.para || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            <Section title="Resumo do Status Atual" icon={Activity}>
              <InfoField label="Principal Objetivo" value={r.main_objective} />
              <InfoField label="Frequência Semanal" value={r.training_frequency} />
              <InfoField label="Nível Atual" value={r.activity_level} />
              <InfoField label="Tempo de Prática" value={r.practice_time} />
              <InfoField
                label="Modalidades Praticadas"
                value={r.modalities}
                className="md:col-span-2 print:col-span-2"
              />
            </Section>

            <Section title="Estilo de Vida Atualizado" icon={CalendarDays}>
              <InfoField label="Refeições/dia" value={r.meals_per_day} />
              <InfoField label="Horas de Sono" value={r.sleep_hours} />
              <InfoField label="Consumo de Álcool" value={r.alcohol} />

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
            </Section>

            <Section title="Saúde e Histórico Médico" icon={HeartPulse}>
              <InfoField label="Diabetes" value={r.diabetes ? 'Sim' : 'Não'} />
              <InfoField label="Hipertensão" value={r.hypertension ? 'Sim' : 'Não'} />
              <InfoField
                label="Uso de Remédios Contínuos"
                value={r.medications?.choice ? 'Sim' : 'Não'}
              />
              {r.medications?.choice && (
                <InfoField
                  label="Lista de Medicamentos"
                  value={r.medications?.list}
                  className="md:col-span-3 print:col-span-3"
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
            </Section>

            {r.client_links && (
              <Section title="Anexos Atualizados" icon={LinkIcon}>
                <LinkField label="Mapeamento de Sintomas" url={r.client_links.symptoms} />
                <LinkField label="Mapeamento da Dor" url={r.client_links.pain} />
                <LinkField label="Bioimpedância (BIA)" url={r.client_links.bia} />
                <LinkField label="My Score" url={r.client_links.myscore} />
              </Section>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
