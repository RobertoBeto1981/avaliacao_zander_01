import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
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
  Printer,
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

  const canSendWhatsApp =
    profile?.roles?.includes('coordenador') ||
    profile?.role === 'coordenador' ||
    profile?.roles?.includes('avaliador') ||
    profile?.role === 'avaliador'

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const { data: reav, error: reavErr } = await supabase
          .from('reavaliacoes')
          .select(
            '*, avaliacao:avaliacoes(id, nome_cliente, evo_id, telefone_cliente, data_avaliacao, respostas)',
          )
          .eq('id', id)
          .single()

        if (reavErr || !reav) throw new Error('Reavaliação não encontrada')

        const { data: allReavs, error: allErr } = await supabase
          .from('reavaliacoes')
          .select('*')
          .eq('avaliacao_original_id', reav.avaliacao_original_id)
          .order('created_at', { ascending: true })

        if (allErr) throw new Error('Erro ao buscar histórico')

        const combinedHistory = [...(allReavs || [])]

        setHistoryData({
          reavaliacoes: combinedHistory,
          avaliacao: reav.avaliacao,
          aluno_nome: reav.avaliacao?.nome_cliente,
          evo_id: reav.avaliacao?.evo_id,
          telefone: reav.avaliacao?.telefone_cliente,
        })

        const currentIndex = combinedHistory.findIndex((r: any) => r.id === id)

        setBaseId(
          currentIndex > 0 ? combinedHistory[currentIndex - 1].id : combinedHistory[0]?.id || '',
        )
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
    const pts: any[] = []

    const reavs = historyData.reavaliacoes || []

    reavs.forEach((r: any, idx: number) => {
      const isSnapshot = idx === 0
      const labelName = isSnapshot ? 'Avaliação Inicial' : `Reavaliação ${idx}`

      pts.push({
        id: r.id,
        label: `${labelName} (${r.data_reavaliacao ? format(new Date(r.data_reavaliacao + 'T12:00:00'), 'dd/MM/yyyy') : '-'})`,
        date: r.data_reavaliacao,
        data: r.respostas_novas
          ? {
              ...r.respostas_novas,
              objectives: r.respostas_novas.objectives,
              periodo_treino: r.respostas_novas.periodo_treino,
            }
          : {},
      })
    })

    return pts
  }, [historyData])

  const basePoint = points.find((p) => p.id === baseId)
  const finalPoint = points.find((p) => p.id === finalId)

  const getFileName = () => {
    if (!historyData) return 'RELATORIO_EVOLUCAO'
    const evoId = historyData.evo_id || 'SEM-ID'
    const nome = historyData.aluno_nome?.replace(/\s+/g, '_').toUpperCase() || 'ALUNO'
    return `${evoId}_${nome}_COMPARATIVO`
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

    const text = `Olá *${historyData.aluno_nome.split(' ')[0]}*, tudo bem?\n\nSegue o seu Relatório Comparativo de Evolução Física!\n\n(Por favor, anexe o arquivo PDF gerado)\n\nMuito obrigado por sua dedicação na Zander Academia. Estamos juntos nessa jornada! 💙`
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

  const baseResp = basePoint.data || {}
  const finalResp = finalPoint.data || {}

  const baseAnthro = baseResp.anthropometry || {}
  const finalAnthro = finalResp.anthropometry || {}

  const baseVo2 = baseResp.vo2_test || {}
  const finalVo2 = finalResp.vo2_test || {}

  const CompField = ({
    label,
    baseVal,
    finalVal,
    suffix = '',
  }: {
    label: string
    baseVal: any
    finalVal: any
    suffix?: string
  }) => {
    const renderVal = (v: any) => {
      if (v === undefined || v === null || v === '') return '-'
      if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
      if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '-'
      if (typeof v === 'object' && v.choice !== undefined) {
        let str = v.choice === true ? 'Sim' : v.choice === false ? 'Não' : String(v.choice)
        const extra = v.list || v.reason || v.amount || v.other || v.observation || v.notes
        if (extra) str += ` - ${extra}`
        return str
      }
      return String(v) + suffix
    }

    const b = renderVal(baseVal)
    const f = renderVal(finalVal)
    const changed = b !== f

    return (
      <div className="flex flex-col py-2 border-b border-border/40 last:border-0 print:border-gray-200">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest print:text-gray-500 mb-1">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-sm',
              changed
                ? 'text-muted-foreground/60 line-through'
                : 'text-foreground font-medium print:text-black',
            )}
          >
            {b}
          </span>
          {changed && (
            <>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-foreground print:text-black">{f}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 self-start mt-1"
          >
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
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            className="flex-1 sm:flex-none border-primary/50 text-primary hover:bg-primary/10"
          >
            <Printer className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF Comparativo</span>
          </Button>
          {historyData?.avaliacao?.id && (
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link to={`/evaluation/${historyData.avaliacao.id}`}>
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Ver Ficha Completa</span>
              </Link>
            </Button>
          )}
          {canSendWhatsApp && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              onClick={handleSendWhatsApp}
            >
              <MessageCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">WhatsApp</span>
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
          Comparativo de Evolução Física
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

      {/* Comparative Content Sections */}
      <div className="grid gap-6 print:block print:space-y-6">
        {/* Antropometria */}
        <Card className="border-border/50 print:border-2 print:border-primary print:shadow-none print:break-inside-avoid">
          <CardHeader className="py-4 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-lg print:text-base uppercase tracking-wider print:text-black font-bold">
              Antropometria Comparativa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            <CompField
              label="Peso"
              baseVal={baseAnthro.weight}
              finalVal={finalAnthro.weight}
              suffix=" kg"
            />
            <CompField
              label="Altura"
              baseVal={baseAnthro.height}
              finalVal={finalAnthro.height}
              suffix=" m"
            />
            <CompField
              label="Ombros"
              baseVal={baseAnthro.shoulders}
              finalVal={finalAnthro.shoulders}
              suffix=" cm"
            />
            <CompField
              label="Tórax"
              baseVal={baseAnthro.chest}
              finalVal={finalAnthro.chest}
              suffix=" cm"
            />
            <CompField
              label="Cintura"
              baseVal={baseAnthro.waist}
              finalVal={finalAnthro.waist}
              suffix=" cm"
            />
            <CompField
              label="Abdômen"
              baseVal={baseAnthro.abdomen}
              finalVal={finalAnthro.abdomen}
              suffix=" cm"
            />
            <CompField
              label="Quadril"
              baseVal={baseAnthro.hips}
              finalVal={finalAnthro.hips}
              suffix=" cm"
            />
            <CompField
              label="Braço Dir. (Rel)"
              baseVal={baseAnthro.right_arm_relaxed}
              finalVal={finalAnthro.right_arm_relaxed}
              suffix=" cm"
            />
            <CompField
              label="Braço Dir. (Con)"
              baseVal={baseAnthro.right_arm_flexed}
              finalVal={finalAnthro.right_arm_flexed}
              suffix=" cm"
            />
            <CompField
              label="Antebraço Dir."
              baseVal={baseAnthro.right_forearm}
              finalVal={finalAnthro.right_forearm}
              suffix=" cm"
            />
            <CompField
              label="Braço Esq. (Rel)"
              baseVal={baseAnthro.left_arm_relaxed}
              finalVal={finalAnthro.left_arm_relaxed}
              suffix=" cm"
            />
            <CompField
              label="Braço Esq. (Con)"
              baseVal={baseAnthro.left_arm_flexed}
              finalVal={finalAnthro.left_arm_flexed}
              suffix=" cm"
            />
            <CompField
              label="Antebraço Esq."
              baseVal={baseAnthro.left_forearm}
              finalVal={finalAnthro.left_forearm}
              suffix=" cm"
            />
            <CompField
              label="Coxa Dir."
              baseVal={baseAnthro.right_thigh}
              finalVal={finalAnthro.right_thigh}
              suffix=" cm"
            />
            <CompField
              label="Coxa Esq."
              baseVal={baseAnthro.left_thigh}
              finalVal={finalAnthro.left_thigh}
              suffix=" cm"
            />
            <CompField
              label="Panturrilha Dir."
              baseVal={baseAnthro.right_calf}
              finalVal={finalAnthro.right_calf}
              suffix=" cm"
            />
            <CompField
              label="Panturrilha Esq."
              baseVal={baseAnthro.left_calf}
              finalVal={finalAnthro.left_calf}
              suffix=" cm"
            />
          </CardContent>
        </Card>

        {/* VO2 */}
        {(baseVo2.enabled || finalVo2.enabled) && (
          <Card className="border-border/50 print:border-2 print:border-primary print:shadow-none print:break-inside-avoid">
            <CardHeader className="py-4 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
              <CardTitle className="text-lg print:text-base uppercase tracking-wider print:text-black font-bold">
                Teste de VO² (Step Test)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
              <CompField
                label="Batimentos (15s)"
                baseVal={baseVo2.beats_15s}
                finalVal={finalVo2.beats_15s}
              />
              <CompField
                label="VO² Máximo"
                baseVal={baseVo2.vo2_max}
                finalVal={finalVo2.vo2_max}
                suffix=" ml/kg/min"
              />
              <CompField
                label="Classificação"
                baseVal={baseVo2.classification}
                finalVal={finalVo2.classification}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
          {/* Treinamento */}
          <Card className="border-border/50 print:border-2 print:border-primary print:shadow-none print:break-inside-avoid">
            <CardHeader className="py-4 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
              <CardTitle className="text-lg print:text-base uppercase tracking-wider print:text-black font-bold">
                Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 gap-x-6 gap-y-2">
              <CompField
                label="Objetivos"
                baseVal={baseResp.objectives}
                finalVal={finalResp.objectives}
              />
              <CompField
                label="Período"
                baseVal={baseResp.periodo_treino}
                finalVal={finalResp.periodo_treino}
              />
              <CompField
                label="Frequência Semanal"
                baseVal={baseResp.training_frequency}
                finalVal={finalResp.training_frequency}
              />
              <CompField
                label="Nível de Atividade"
                baseVal={baseResp.activity_level}
                finalVal={finalResp.activity_level}
              />
              <CompField
                label="Tempo de Prática"
                baseVal={baseResp.practice_time}
                finalVal={finalResp.practice_time}
              />
              <CompField
                label="Modalidades"
                baseVal={baseResp.modalities}
                finalVal={finalResp.modalities}
              />
            </CardContent>
          </Card>

          {/* Saúde */}
          <Card className="border-border/50 print:border-2 print:border-primary print:shadow-none print:break-inside-avoid">
            <CardHeader className="py-4 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
              <CardTitle className="text-lg print:text-base uppercase tracking-wider print:text-black font-bold">
                Saúde e Estilo de Vida
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <CompField
                label="Refeições/dia"
                baseVal={baseResp.meals_per_day}
                finalVal={finalResp.meals_per_day}
              />
              <CompField
                label="Sono"
                baseVal={baseResp.sleep_hours}
                finalVal={finalResp.sleep_hours}
              />
              <CompField label="Álcool" baseVal={baseResp.alcohol} finalVal={finalResp.alcohol} />
              <CompField label="Fumante" baseVal={baseResp.smoking} finalVal={finalResp.smoking} />
              <CompField label="Dores" baseVal={baseResp.pains} finalVal={finalResp.pains} />
              <CompField
                label="Medicamentos"
                baseVal={baseResp.medications}
                finalVal={finalResp.medications}
              />
              <CompField
                label="Diabético"
                baseVal={baseResp.diabetes}
                finalVal={finalResp.diabetes}
              />
              <CompField
                label="Hipertenso"
                baseVal={baseResp.hypertension}
                finalVal={finalResp.hypertension}
              />
              <CompField
                label="Alergias"
                baseVal={baseResp.allergies}
                finalVal={finalResp.allergies}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden print:block mt-12 text-center text-sm text-gray-500 border-t pt-4">
        Zander Academia - Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}
      </div>
    </div>
  )
}
