import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { getEvaluationById } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Edit, MessageSquare, Repeat, Printer } from 'lucide-react'
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

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const ev = await getEvaluationById(id)
        setData(ev)
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

  const evalDate = data.data_avaliacao ? new Date(data.data_avaliacao + 'T12:00:00') : null
  const reevalDate = data.data_reavaliacao ? new Date(data.data_reavaliacao + 'T12:00:00') : null
  const dobDate = respostas.data_nascimento
    ? new Date(respostas.data_nascimento + 'T12:00:00')
    : null

  const handlePrint = () => {
    window.print()
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Printer className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Button
            variant="secondary"
            className="bg-secondary/60 hover:bg-secondary"
            onClick={() => setAcompanhamentoOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Anotações / Ações
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/evaluation/edit/${data.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/evaluation/${data.id}/reevaluate`}>
              <Repeat className="w-4 h-4 mr-2" />
              Reavaliar
            </Link>
          </Button>
        </div>
      </div>

      <div className="print:block hidden mb-6 text-center border-b border-border/50 pb-4">
        <h1 className="text-2xl font-bold uppercase text-foreground">
          Relatório de Avaliação Física
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Academia ZANDER</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 print:block print:space-y-6 print:text-[13px] text-sm">
        <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider">
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3">
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

        <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider">
              Treinamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3">
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

        <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider">
              Saúde e Estilo de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3">
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

        <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider">
              Antropometria
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 print:py-2 print:px-3">
            <div className="grid grid-cols-2 gap-2">
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
                <strong>Coxa Dir.:</strong>{' '}
                {anthropometry.right_thigh ? `${anthropometry.right_thigh} cm` : '-'}
              </p>
              <p>
                <strong>Coxa Esq.:</strong>{' '}
                {anthropometry.left_thigh ? `${anthropometry.left_thigh} cm` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {vo2Test.enabled && (
          <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent md:col-span-2 print:break-inside-avoid print:mb-6">
            <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
              <CardTitle className="text-base print:text-sm uppercase tracking-wider">
                Teste de VO² (Step Test)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 py-3 print:py-2 print:px-3 flex flex-wrap gap-x-12 gap-y-2">
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

        <Card className="print:shadow-none print:border print:border-border/50 print:bg-transparent md:col-span-2 print:break-inside-avoid print:mb-6">
          <CardHeader className="py-3 print:py-2 print:px-3 bg-muted/20 print:bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base print:text-sm uppercase tracking-wider">
              Observações do Avaliador
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 print:py-2 print:px-3">
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
