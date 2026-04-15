import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReavaliacaoById, getAvaliacaoHistory, calculateEvolucao } from '@/services/reavaliacoes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  User,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function ReevaluationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()

  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [baseId, setBaseId] = useState<string>('')
  const [finalId, setFinalId] = useState<string>('')

  const canSendWhatsApp = profile?.role === 'coordenador' || profile?.role === 'avaliador'

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const reav = await getReavaliacaoById(id)
        if (!reav) throw new Error('Reavaliação não encontrada')

        const hist = await getAvaliacaoHistory(reav.avaliacao_original_id)
        setHistoryData({
          ...hist,
          aluno_nome: reav.avaliacao?.nome_cliente,
          evo_id: reav.avaliacao?.evo_id,
          telefone: reav.avaliacao?.telefone_cliente,
        })

        const reavs = hist.reavaliacoes || []
        const currentIndex = reavs.findIndex((r: any) => r.id === id)

        setBaseId(currentIndex > 0 ? reavs[currentIndex - 1].id : 'original')
        setFinalId(id)
      } catch (err: any) {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, toast, navigate])

  const points = useMemo(() => {
    if (!historyData) return []
    const pts = []
    if (historyData.original) {
      pts.push({
        id: 'original',
        label: `Avaliação Inicial (${historyData.original.data_avaliacao ? format(new Date(historyData.original.data_avaliacao + 'T12:00:00'), 'dd/MM/yyyy') : '-'})`,
        date: historyData.original.data_avaliacao,
        data: historyData.original.respostas || {},
      })
    }
    ;(historyData.reavaliacoes || []).forEach((r: any, idx: number) => {
      pts.push({
        id: r.id,
        label: `Reavaliação ${idx + 1} (${r.data_reavaliacao ? format(new Date(r.data_reavaliacao + 'T12:00:00'), 'dd/MM/yyyy') : '-'})`,
        date: r.data_reavaliacao,
        data: r.respostas_novas || {},
      })
    })
    return pts
  }, [historyData])

  const basePoint = points.find((p) => p.id === baseId)
  const finalPoint = points.find((p) => p.id === finalId)

  const evolucaoDinamica = useMemo(() => {
    if (!basePoint || !finalPoint) return []
    return calculateEvolucao(basePoint.data, finalPoint.data)
  }, [basePoint, finalPoint])

  const getFileName = () => {
    if (!historyData) return 'RELATORIO_EVOLUCAO'
    const evoId = historyData.evo_id || 'SEM-ID'
    const nome = historyData.aluno_nome?.replace(/\s+/g, '_').toUpperCase() || 'ALUNO'
    return `${evoId}_${nome}_EVOLUCAO`
  }

  const handleSendWhatsApp = () => {
    if (!historyData?.telefone) {
      toast({
        title: 'Telefone indisponível',
        description: 'Cliente sem telefone.',
        variant: 'destructive',
      })
      return
    }
    let phone = historyData.telefone.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const text = `Olá *${historyData.aluno_nome.split(' ')[0]}*, tudo bem?\n\nSegue o seu Relatório Comparativo de Evolução!\n\n(Por favor, anexe o arquivo PDF gerado)\n\nMuito obrigado por sua dedicação na Zander Academia. Estamos juntos nessa jornada! 💙`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleGeneratePDF = () => {
    const originalTitle = document.title
    document.title = getFileName()
    window.print()
    setTimeout(() => {
      document.title = originalTitle
      toast({ title: 'Sucesso', description: 'Relatório preparado para impressão/PDF.' })
    }, 500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!historyData || !basePoint || !finalPoint) return null

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Relatório Comparativo
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <User className="w-4 h-4" /> {historyData.aluno_nome}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              WhatsApp
            </Button>
          )}
        </div>
      </div>

      {/* PDF Header */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-primary pb-6 mb-8 text-center">
        <img
          src="https://img.usecurling.com/i?q=gym+logo&color=gradient"
          alt="Logo"
          className="h-16 mb-4 grayscale"
        />
        <h1 className="text-3xl font-bold text-black uppercase tracking-widest">
          Relatório de Evolução Física
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mt-2">{historyData.aluno_nome}</h2>
        <p className="text-gray-500 mt-1">EVO: {historyData.evo_id || 'N/A'}</p>
      </div>

      {/* Selection Controls */}
      <Card className="border-border/50 print:border-none print:shadow-none print:bg-transparent bg-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 print:text-black">
                <CalendarDays className="w-4 h-4" /> Avaliação Base
              </label>
              <div className="print:hidden">
                <Select value={baseId} onValueChange={setBaseId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {points.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden print:block font-bold text-lg">{basePoint.label}</div>
            </div>

            <div className="shrink-0 flex items-center justify-center print:hidden">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 print:text-black">
                <Activity className="w-4 h-4" /> Avaliação Final
              </label>
              <div className="print:hidden">
                <Select value={finalId} onValueChange={setFinalId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {points.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden print:block font-bold text-lg">{finalPoint.label}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolução Dinâmica */}
      <Card className="border-border/50 print:border-none print:shadow-none">
        <CardHeader className="print:px-0">
          <CardTitle className="text-2xl print:text-black border-b pb-2">
            Comparativo de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="print:px-0">
          {evolucaoDinamica.length > 0 ? (
            <div className="grid gap-4">
              {evolucaoDinamica.map((ev: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-xl bg-background/50 print:bg-white print:border-gray-200 shadow-sm gap-4 transition-all hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-foreground print:text-black">
                      {ev.campo}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-md text-sm font-medium">
                        {ev.de || 'N/A'}
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div
                        className={cn(
                          'px-3 py-1.5 rounded-md text-sm font-bold shadow-sm',
                          ev.status === 'melhorou'
                            ? 'bg-green-100 text-green-700 print:bg-gray-100 print:text-black'
                            : ev.status === 'piorou'
                              ? 'bg-red-100 text-red-700 print:bg-gray-100 print:text-black'
                              : 'bg-blue-100 text-blue-700 print:bg-gray-100 print:text-black',
                        )}
                      >
                        {ev.para || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-end">
                    {ev.status === 'melhorou' && (
                      <span className="flex items-center text-green-600 bg-green-100/50 px-4 py-2 rounded-full text-sm font-bold print:border print:border-green-300">
                        <TrendingUp className="w-5 h-5 mr-2" /> Melhorou
                      </span>
                    )}
                    {ev.status === 'piorou' && (
                      <span className="flex items-center text-red-600 bg-red-100/50 px-4 py-2 rounded-full text-sm font-bold print:border print:border-red-300">
                        <TrendingDown className="w-5 h-5 mr-2" /> Piorou
                      </span>
                    )}
                    {ev.status === 'manteve' && (
                      <span className="flex items-center text-blue-600 bg-blue-100/50 px-4 py-2 rounded-full text-sm font-bold print:border print:border-blue-300">
                        <Minus className="w-5 h-5 mr-2" /> Manteve
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">
                Nenhuma alteração registrada entre as avaliações selecionadas.
              </p>
              <p className="text-sm opacity-70">
                Os dados analisados (antropometria, hábitos, etc.) se mantiveram inalterados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respostas Finais */}
      <Card className="border-border/50 print:border-none print:shadow-none print:break-before-page">
        <CardHeader className="print:px-0">
          <CardTitle className="text-2xl print:text-black border-b pb-2">
            Detalhes da Avaliação Final ({finalPoint.label})
          </CardTitle>
        </CardHeader>
        <CardContent className="print:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(finalPoint.data || {}).map(([key, value]) => {
              if (!value || (typeof value === 'object' && Object.keys(value).length === 0))
                return null
              if (
                [
                  'objectives',
                  'periodo_treino',
                  'final_observations',
                  'professor_observations',
                  'client_links',
                ].includes(key)
              )
                return null

              let displayValue = String(value)
              if (typeof value === 'boolean') displayValue = value ? 'Sim' : 'Não'
              if (Array.isArray(value)) displayValue = value.join(', ')
              if (typeof value === 'object' && !Array.isArray(value)) {
                const obj = value as any
                if (obj.choice !== undefined) {
                  displayValue = `${obj.choice === true ? 'Sim' : obj.choice === false ? 'Não' : obj.choice}`
                  if (
                    obj.list ||
                    obj.reason ||
                    obj.amount ||
                    obj.other ||
                    obj.observation ||
                    obj.notes
                  ) {
                    displayValue += ` - ${obj.list || obj.reason || obj.amount || obj.other || obj.observation || obj.notes}`
                  }
                } else if (obj.choices) {
                  displayValue = obj.choices.join(', ')
                  if (obj.list) displayValue += ` - ${obj.list}`
                } else if (key === 'vo2_test' || obj.vo2_max) {
                  displayValue = obj.enabled
                    ? `VO² Máx: ${obj.vo2_max} ml/kg/min (${obj.classification})`
                    : 'Não realizado'
                } else if (key === 'anthropometry' || obj.weight) {
                  displayValue = `Peso: ${obj.weight || '-'}kg | Altura: ${obj.height || '-'}m`
                } else if (key === 'hemodynamics' || obj.systolic_bp) {
                  displayValue = `PA: ${obj.systolic_bp || '-'}x${obj.diastolic_bp || '-'} | FC: ${obj.heart_rate || '-'}`
                } else {
                  displayValue = JSON.stringify(value)
                }
              }

              const labelMap: Record<string, string> = {
                training_frequency: 'Frequência de Treino',
                activity_level: 'Nível de Atividade',
                sleep_hours: 'Horas de Sono',
                meals_per_day: 'Refeições/Dia',
                alcohol: 'Consumo de Álcool',
                smoking: 'Tabagismo',
                medications: 'Medicamentos',
                pains: 'Dores',
                surgeries: 'Cirurgias',
                anthropometry: 'Antropometria (Geral)',
                vo2_test: 'Teste VO²',
                hemodynamics: 'Hemodinâmica',
                health_insurance: 'Plano de Saúde',
                discovery_source: 'Como nos conheceu',
                session_duration: 'Duração da Sessão',
              }

              const translatedKey = labelMap[key] || key.replace(/_/g, ' ')

              return (
                <div
                  key={key}
                  className="p-4 bg-muted/30 border border-border/50 rounded-lg shadow-sm print:bg-white print:border-gray-300 print:shadow-none break-inside-avoid"
                >
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 print:text-gray-500">
                    {translatedKey}
                  </p>
                  <p className="font-semibold text-sm text-foreground print:text-black">
                    {displayValue}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="hidden print:block mt-12 text-center text-sm text-gray-500 border-t pt-4">
        Zander Academia - Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
      </div>
    </div>
  )
}
