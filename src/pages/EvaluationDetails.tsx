import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { getEvaluationById } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  Edit,
  MessageSquare,
  Repeat,
  Printer,
  History,
  MessageCircle,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { HistoryDialog } from '@/components/HistoryDialog'

export default function EvaluationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acompanhamentoOpen, setAcompanhamentoOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [latestReavId, setLatestReavId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const ev = await getEvaluationById(id)
        setData(ev)

        const { data: reavs } = await supabase
          .from('reavaliacoes')
          .select('id')
          .eq('avaliacao_original_id', id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (reavs && reavs.length > 0) {
          setLatestReavId(reavs[0].id)
        }
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Erro', description: err.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, toast])

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  if (!data)
    return <div className="p-8 text-center text-muted-foreground">Avaliação não encontrada.</div>

  const respostas = data.respostas || {}
  const anthropometry = respostas.anthropometry || {}
  const vo2Test = respostas.vo2_test || {}

  const parseDateString = (dateStr: any) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return isValid(d) ? d : null
  }

  const evalDate = data.data_avaliacao ? new Date(data.data_avaliacao + 'T12:00:00') : null
  const reevalDate = data.data_reavaliacao ? new Date(data.data_reavaliacao + 'T12:00:00') : null
  const dobDate = parseDateString(respostas.data_nascimento)

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    if (!data.telefone_cliente) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Cliente sem telefone cadastrado.',
      })
      return
    }
    const phone = data.telefone_cliente.replace(/\D/g, '')
    const number = phone.startsWith('55') ? phone : `55${phone}`
    const links = data.links_avaliacao?.[0] || {}

    let text = `Olá *${data.nome_cliente.split(' ')[0]}*, tudo bem?\n\nAbaixo estão os links da sua avaliação:\n\n`
    if (links.anamnese_url) text += `📝 *Anamnese:* ${links.anamnese_url}\n`
    if (links.mapeamento_sintomas_url) text += `🔍 *Sintomas:* ${links.mapeamento_sintomas_url}\n`
    if (links.mapeamento_dor_url) text += `🎯 *Dor:* ${links.mapeamento_dor_url}\n`
    if (links.bia_url) text += `⚖️ *BIA:* ${links.bia_url}\n`
    if (links.my_score_url) text += `📊 *My Score:* ${links.my_score_url}\n`
    if (links.relatorio_pdf_url) text += `📄 *Relatório PDF:* ${links.relatorio_pdf_url}\n`

    text += `\nMuito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! 💙`

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in print:py-4 print:px-0">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.nome_cliente}</h1>
            <p className="text-muted-foreground mt-1">ID EVO: {data.evo_id || 'Não informado'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          {latestReavId && (
            <Button
              variant="outline"
              asChild
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30 flex-1 sm:flex-none"
            >
              <Link to={`/reevaluation/${latestReavId}`}>
                <TrendingUp className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Comparativo</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30 print:hidden flex-1 sm:flex-none"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-primary/50 text-primary hover:bg-primary/10 flex-1 sm:flex-none"
          >
            <Printer className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Gerar PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <History className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
          <Button
            variant="secondary"
            className="bg-secondary/60 hover:bg-secondary flex-1 sm:flex-none w-full sm:w-auto"
            onClick={() => setAcompanhamentoOpen(true)}
          >
            <MessageSquare className="w-4 h-4 sm:mr-2" />
            <span className="truncate">Anotações / Ações</span>
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link to={`/evaluation/edit/${data.id}`}>
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Link>
          </Button>
          <Button asChild className="flex-1 sm:flex-none w-full sm:w-auto">
            <Link to={`/evaluation/${data.id}/reevaluate`}>
              <Repeat className="w-4 h-4 sm:mr-2" />
              <span className="truncate">Reavaliar</span>
            </Link>
          </Button>
        </div>
      </div>

      {(() => {
        const isValidLink = (url: any) => typeof url === 'string' && url.trim() !== ''
        const hasLinks =
          data.links_avaliacao &&
          data.links_avaliacao.length > 0 &&
          (isValidLink(data.links_avaliacao[0].anamnese_url) ||
            isValidLink(data.links_avaliacao[0].mapeamento_sintomas_url) ||
            isValidLink(data.links_avaliacao[0].mapeamento_dor_url) ||
            isValidLink(data.links_avaliacao[0].bia_url) ||
            isValidLink(data.links_avaliacao[0].my_score_url) ||
            isValidLink(data.links_avaliacao[0].relatorio_pdf_url))

        if (!hasLinks) return null

        return (
          <Card className="print:hidden mb-6 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="py-3 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900">
              <CardTitle className="text-base uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Links da Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 flex flex-wrap gap-3">
              {isValidLink(data.links_avaliacao[0].anamnese_url) && (
                <a
                  href={data.links_avaliacao[0].anamnese_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                >
                  📝 Anamnese
                </a>
              )}
              {isValidLink(data.links_avaliacao[0].mapeamento_sintomas_url) && (
                <a
                  href={data.links_avaliacao[0].mapeamento_sintomas_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                >
                  🔍 Sintomas
                </a>
              )}
              {isValidLink(data.links_avaliacao[0].mapeamento_dor_url) && (
                <a
                  href={data.links_avaliacao[0].mapeamento_dor_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                >
                  🎯 Mapa de Dor
                </a>
              )}
              {isValidLink(data.links_avaliacao[0].bia_url) && (
                <a
                  href={data.links_avaliacao[0].bia_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                >
                  ⚖️ BIA
                </a>
              )}
              {isValidLink(data.links_avaliacao[0].my_score_url) && (
                <a
                  href={data.links_avaliacao[0].my_score_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium"
                >
                  📊 My Score
                </a>
              )}
              {isValidLink(data.links_avaliacao[0].relatorio_pdf_url) && (
                <a
                  href={data.links_avaliacao[0].relatorio_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 font-medium"
                >
                  📄 Relatório PDF
                </a>
              )}
            </CardContent>
          </Card>
        )
      })()}

      <div className="print:block hidden mb-6 text-center border-b print:border-primary/50 pb-4">
        <h1 className="text-2xl font-bold uppercase print:text-black">
          Relatório de Avaliação Física
        </h1>
        <p className="text-sm mt-1 print:text-black">Academia ZANDER</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block print:space-y-6 print:text-[13px] text-sm">
        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 print:text-black">
            <p>
              <strong>Nome:</strong> {data.nome_cliente}
            </p>
            <p>
              <strong>Telefone:</strong> {data.telefone_cliente || '-'}
            </p>
            <p>
              <strong>Data Nasc.:</strong>{' '}
              {dobDate && isValid(dobDate) ? format(dobDate, 'dd/MM/yyyy') : '-'}
            </p>
            <p>
              <strong>Gênero:</strong> {respostas.gender || '-'}
            </p>
            <p>
              <strong>Data Avaliação:</strong>{' '}
              {evalDate && isValid(evalDate) ? format(evalDate, 'dd/MM/yyyy') : '-'}
            </p>
            <p>
              <strong>Data Reavaliação:</strong>{' '}
              {reevalDate && isValid(reevalDate) ? format(reevalDate, 'dd/MM/yyyy') : '-'}
            </p>
            <div className="print:hidden">
              <strong>Status:</strong> <Badge className="ml-1">{data.status || 'pendente'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Treinamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 print:text-black">
            <p>
              <strong>Objetivos:</strong> {data.objectives?.join(', ') || '-'}
            </p>
            <p>
              <strong>Período:</strong> {data.periodo_treino || '-'}
            </p>
            <p>
              <strong>Frequência Semanal:</strong> {respostas.training_frequency || '-'}
            </p>
            <p>
              <strong>Nível de Atividade:</strong> {respostas.activity_level || '-'}
            </p>
            <p>
              <strong>Tempo de Prática:</strong> {respostas.practice_time || '-'}
            </p>
            <p>
              <strong>Modalidades:</strong> {respostas.modalities || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Preferências de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 print:text-black">
            <p>
              <strong>Dias Disponíveis:</strong> {respostas.available_days?.join(', ') || '-'}
            </p>
            <p>
              <strong>Tempo por Sessão:</strong> {respostas.session_duration || '-'}
            </p>
            <p>
              <strong>Como soube da academia:</strong> {respostas.discovery_source || '-'}
            </p>
            <p>
              <strong>Gosta de Treinar:</strong> {respostas.enjoys_training?.join(', ') || '-'}
            </p>
            <p>
              <strong>Incomoda no espelho:</strong>{' '}
              {respostas.dislikes_looking_at?.join(', ') || '-'}
            </p>
            <p>
              <strong>Não gosta de Treinar:</strong>{' '}
              {respostas.dislikes_training?.join(', ') || '-'}
            </p>
            <p>
              <strong>Exercícios Favoritos:</strong> {respostas.favorite_exercises || '-'}
            </p>
            <p>
              <strong>Exercícios que não gosta:</strong> {respostas.hated_exercises || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Saúde e Estilo de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 print:text-black">
            <p>
              <strong>Refeições/dia:</strong> {respostas.meals_per_day || '-'}
            </p>
            <p>
              <strong>Sono:</strong> {respostas.sleep_hours || '-'}
            </p>
            <p>
              <strong>Álcool:</strong> {respostas.alcohol || '-'}
            </p>
            <p>
              <strong>Fumante:</strong>{' '}
              {respostas.smoking?.choice ? `Sim (${respostas.smoking.amount})` : 'Não'}
            </p>
            <p>
              <strong>Diabético:</strong> {respostas.diabetes ? 'Sim' : 'Não'}
            </p>
            <p>
              <strong>Hipertenso:</strong> {respostas.hypertension ? 'Sim' : 'Não'}
            </p>
            <p>
              <strong>Medicamentos:</strong>{' '}
              {respostas.medications?.choice
                ? `Sim - ${respostas.medications.list?.replace(/\n/g, ', ')}`
                : 'Não'}
            </p>
            <p>
              <strong>Alergias:</strong>{' '}
              {respostas.allergies?.choice ? `Sim - ${respostas.allergies.list}` : 'Não'}
            </p>
            <p>
              <strong>Dores:</strong>{' '}
              {respostas.pains?.choice ? `Sim - ${respostas.pains.observation}` : 'Não'}
            </p>
            <p>
              <strong>Contato Emergência:</strong> {respostas.emergency_contact || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white print:break-inside-avoid print:mb-6 md:col-span-2">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Antropometria
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 print:py-2 print:px-3 print:text-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 print:grid-cols-4">
              <p>
                <strong>Peso:</strong> {anthropometry.weight ? `${anthropometry.weight} kg` : '-'}
              </p>
              <p>
                <strong>Altura:</strong> {anthropometry.height ? `${anthropometry.height} m` : '-'}
              </p>
              <p>
                <strong>Ombros:</strong>{' '}
                {anthropometry.shoulders ? `${anthropometry.shoulders} cm` : '-'}
              </p>
              <p>
                <strong>Tórax:</strong> {anthropometry.chest ? `${anthropometry.chest} cm` : '-'}
              </p>
              <p>
                <strong>Cintura:</strong> {anthropometry.waist ? `${anthropometry.waist} cm` : '-'}
              </p>
              <p>
                <strong>Abdômen:</strong>{' '}
                {anthropometry.abdomen ? `${anthropometry.abdomen} cm` : '-'}
              </p>
              <p>
                <strong>Quadril:</strong> {anthropometry.hips ? `${anthropometry.hips} cm` : '-'}
              </p>
              <p>
                <strong>Braço Dir. (Rel):</strong>{' '}
                {anthropometry.right_arm_relaxed ? `${anthropometry.right_arm_relaxed} cm` : '-'}
              </p>
              <p>
                <strong>Braço Dir. (Con):</strong>{' '}
                {anthropometry.right_arm_flexed ? `${anthropometry.right_arm_flexed} cm` : '-'}
              </p>
              <p>
                <strong>Antebraço Dir.:</strong>{' '}
                {anthropometry.right_forearm ? `${anthropometry.right_forearm} cm` : '-'}
              </p>
              <p>
                <strong>Braço Esq. (Rel):</strong>{' '}
                {anthropometry.left_arm_relaxed ? `${anthropometry.left_arm_relaxed} cm` : '-'}
              </p>
              <p>
                <strong>Braço Esq. (Con):</strong>{' '}
                {anthropometry.left_arm_flexed ? `${anthropometry.left_arm_flexed} cm` : '-'}
              </p>
              <p>
                <strong>Antebraço Esq.:</strong>{' '}
                {anthropometry.left_forearm ? `${anthropometry.left_forearm} cm` : '-'}
              </p>
              <p>
                <strong>Coxa Dir.:</strong>{' '}
                {anthropometry.right_thigh ? `${anthropometry.right_thigh} cm` : '-'}
              </p>
              <p>
                <strong>Coxa Esq.:</strong>{' '}
                {anthropometry.left_thigh ? `${anthropometry.left_thigh} cm` : '-'}
              </p>
              <p>
                <strong>Panturrilha Dir.:</strong>{' '}
                {anthropometry.right_calf ? `${anthropometry.right_calf} cm` : '-'}
              </p>
              <p>
                <strong>Panturrilha Esq.:</strong>{' '}
                {anthropometry.left_calf ? `${anthropometry.left_calf} cm` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {vo2Test.enabled && (
          <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white md:col-span-2 print:break-inside-avoid print:mb-6">
            <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
              <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
                Teste de VO² (Step Test)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 flex flex-col sm:flex-row flex-wrap sm:gap-x-12 gap-y-2 print:text-black">
              <p>
                <strong>Batimentos (15s):</strong> {vo2Test.beats_15s || '-'}
              </p>
              <p>
                <strong>VO² Máximo:</strong>{' '}
                {vo2Test.vo2_max ? `${vo2Test.vo2_max} ml/kg/min` : '-'}
              </p>
              <p>
                <strong>Classificação:</strong>{' '}
                <span className="font-bold text-primary print:text-black">
                  {vo2Test.classification || '-'}
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="print:shadow-none print:border-2 print:border-primary print:bg-white md:col-span-2 print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-primary/10 border-b border-border/50 print:border-primary/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider print:text-black print:font-bold">
              Observações do Avaliador
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 print:py-2 print:px-3 print:text-black">
            <p className="whitespace-pre-wrap">
              {respostas.final_observations || 'Nenhuma observação registrada.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <AcompanhamentoDialog
        open={acompanhamentoOpen}
        onOpenChange={setAcompanhamentoOpen}
        avaliacaoId={data.id}
        nomeCliente={data.nome_cliente}
        evoId={data.evo_id}
      />
      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        avaliacaoId={data.id}
        nomeCliente={data.nome_cliente}
        evoId={data.evo_id}
      />
    </div>
  )
}
