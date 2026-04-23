import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, isAfter, startOfDay, differenceInDays } from 'date-fns'
import {
  FileText,
  HeartPulse,
  Activity,
  Scale,
  Target,
  AlertCircle,
  MessageSquare,
  History,
  MessageCircle,
  Edit,
  FileEdit,
  Download,
  Trash2,
  Trophy,
  CheckCircle2,
  Plus,
  UserPlus,
  Loader2,
} from 'lucide-react'
import {
  getEvaluations,
  updateEvaluationStatus,
  deleteEvaluation,
  activateDesafioZander,
  markDesafioZanderSent,
} from '@/services/evaluations'
import {
  getPendingProfessorRequests,
  respondProfessorRequest,
  updateAvaliacaoProfessor,
} from '@/services/professor_requests'
import { getUsers } from '@/services/users'
import { calculateDeadline } from '@/lib/holidays'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { HistoryDialog } from '@/components/HistoryDialog'
import { DashboardCharts } from '@/components/coordinator/DashboardCharts'
import { supabase } from '@/lib/supabase/client'
import { UserManagementTab } from '@/components/coordinator/UserManagementTab'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { EditarCadastroDialog, EditarAvaliacaoDialog } from '@/components/StudentCard'

export default function CoordinatorDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [professorRequests, setProfessorRequests] = useState<any[]>([])
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const [historyEval, setHistoryEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)

  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const [editCadastroEv, setEditCadastroEv] = useState<any>(null)
  const [editAvaliacaoEv, setEditAvaliacaoEv] = useState<any>(null)
  const [exportMonth, setExportMonth] = useState<string>(new Date().getMonth().toString())
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState('')

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro Avaliações', description: e.message })
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro Usuários', description: e.message })
    }
  }

  const loadRequests = async () => {
    try {
      const data = await getPendingProfessorRequests()
      setProfessorRequests(data)
    } catch (e: any) {
      console.error(e)
    }
  }

  const initializeData = useCallback(async () => {
    await Promise.all([loadData(), loadUsers(), loadRequests()])
    setInitialLoading(false)
  }, [])

  useEffect(() => {
    initializeData()

    const handleUpdate = () => loadData()
    window.addEventListener('avaliacao_updated', handleUpdate)
    return () => window.removeEventListener('avaliacao_updated', handleUpdate)
  }, [initializeData])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEvaluationStatus(id, status)
      setEvaluations((prev) =>
        prev.map((ev) =>
          ev.id === id
            ? {
                ...ev,
                status,
                desafio_zander_status: status === 'concluido' ? 'nenhum' : ev.desafio_zander_status,
              }
            : ev,
        ),
      )
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleProfessorChange = async (avaliacaoId: string, profId: string) => {
    try {
      const val = profId === 'unassigned' ? null : profId
      await updateAvaliacaoProfessor(avaliacaoId, val)
      setEvaluations((prev) =>
        prev.map((ev) =>
          ev.id === avaliacaoId
            ? {
                ...ev,
                professor_id: val,
                professor: val ? users.find((u) => u.id === val) : null,
              }
            : ev,
        ),
      )
      toast({ title: 'Sucesso', description: 'Professor atualizado com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleRespondRequest = async (
    reqId: string,
    status: 'aprovado' | 'rejeitado',
    evId: string,
    profId: string,
  ) => {
    try {
      await respondProfessorRequest(reqId, status, evId, profId)
      setProfessorRequests((prev) => prev.filter((r) => r.id !== reqId))
      if (status === 'aprovado') {
        loadData()
      }
      toast({ title: 'Sucesso', description: `Solicitação ${status}.` })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este cliente e sua avaliação permanentemente? Esta ação não pode ser desfeita.',
      )
    )
      return
    try {
      await deleteEvaluation(id)
      setEvaluations((prev) => prev.filter((ev) => ev.id !== id))
      toast({ title: 'Sucesso', description: 'Cliente e avaliação excluídos com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleActivateDesafio = async (id: string) => {
    try {
      await activateDesafioZander(id)
      toast({
        title: 'Desafio Ativado',
        description: 'Aluno adicionado à fila e redirecionado ao professor responsável.',
      })
      loadData()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao ativar desafio', description: e.message })
    }
  }

  const handleSendDesafioWhatsApp = async (ev: any) => {
    if (!ev.telefone_cliente) {
      toast({
        title: 'Atenção',
        description: 'Cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }

    let phone = ev.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const firstName = ev.nome_cliente.trim().split(' ')[0]

    const EMOJI_ROCKET = '\uD83D\uDE80'
    const EMOJI_MUSCLE = '\uD83D\uDCAA'

    try {
      const { data: tpl } = await supabase
        .from('message_templates')
        .select('template')
        .eq('id', 'desafio_zander')
        .single()
      let text =
        tpl?.template ||
        `Fala, {{nome}}! ${EMOJI_ROCKET} Você acaba de aceitar o #DesafioZander! Parabéns pela decisão. O foco agora é total na sua evolução: nosso time entrará em contato em breve para alinharmos os detalhes e garantirmos que você chegue na sua reavaliação daqui a 30 dias com resultados incríveis. Vamos pra cima! ${EMOJI_MUSCLE}`

      text = text.replace(/{{nome}}/g, firstName)

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')

      await markDesafioZanderSent(ev.id)
      setEvaluations((prev) =>
        prev.map((e) => (e.id === ev.id ? { ...e, desafio_zander_status: 'enviado' } : e)),
      )
      toast({ title: 'Sucesso', description: 'Mensagem do desafio enviada.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleExportCSV = () => {
    const filtered = evaluations.filter((ev) => {
      if (!ev.data_avaliacao) return false
      const date = new Date(ev.data_avaliacao + 'T12:00:00')
      return (
        date.getMonth() === parseInt(exportMonth) && date.getFullYear() === parseInt(exportYear)
      )
    })

    if (filtered.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há avaliações concluídas no período selecionado.',
        variant: 'destructive',
      })
      return
    }

    const headers = ['Nome do Cliente', 'Data da Avaliação', 'Nome do Avaliador']
    const rows = filtered.map((ev) => [
      ev.nome_cliente,
      format(new Date(ev.data_avaliacao + 'T12:00:00'), 'dd/MM/yyyy'),
      ev.avaliador?.nome || 'Não informado',
    ])

    const csvContent = [
      headers.join(';'),
      ...rows.map((e) => e.map((f) => `"${f}"`).join(';')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `avaliacoes_${parseInt(exportMonth) + 1}_${exportYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExportOpen(false)
    toast({ title: 'Relatório Gerado', description: 'A planilha foi baixada com sucesso.' })
  }

  const handleSendWhatsApp = async (ev: any) => {
    if (!ev.telefone_cliente) {
      toast({
        title: 'Atenção',
        description: 'Cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }

    let phone = ev.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const links = ev.links_avaliacao?.[0] || {}
    const firstName = ev.nome_cliente.trim().split(' ')[0]

    const EMOJI_MEMO = '\uD83D\uDCDD'
    const EMOJI_MAG = '\uD83D\uDD0D'
    const EMOJI_TARGET = '\uD83C\uDFAF'
    const EMOJI_SCALE = '\u2696\uFE0F'
    const EMOJI_CHART = '\uD83D\uDCCA'
    const EMOJI_HEART = '\uD83D\uDC99'

    let linksStr = ''
    if (links.anamnese_url) linksStr += `${EMOJI_MEMO} *Anamnese:* ${links.anamnese_url}\n`
    if (links.mapeamento_sintomas_url)
      linksStr += `${EMOJI_MAG} *Sintomas:* ${links.mapeamento_sintomas_url}\n`
    if (links.mapeamento_dor_url) linksStr += `${EMOJI_TARGET} *Dor:* ${links.mapeamento_dor_url}\n`
    if (links.bia_url) linksStr += `${EMOJI_SCALE} *BIA:* ${links.bia_url}\n`
    if (links.my_score_url) linksStr += `${EMOJI_CHART} *My Score:* ${links.my_score_url}\n`

    try {
      const { data: tpl } = await supabase
        .from('message_templates')
        .select('template')
        .eq('id', 'links_avaliacao')
        .single()
      let text =
        tpl?.template ||
        `Olá, {{nome}}, tudo bem?\n\nAbaixo estão os links da sua avaliação:\n\n{{links}}\n\nMuito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! ${EMOJI_HEART}`

      text = text.replace(/{{nome}}/g, firstName).replace(/{{links}}/g, linksStr.trim())

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
      toast({ title: 'WhatsApp Aberto', description: 'A janela do WhatsApp foi aberta.' })
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = useMemo(() => {
    const statusOrder: Record<string, number> = {
      pendente: 1,
      em_progresso: 2,
      concluido: 3,
    }
    const result = evaluations.filter((ev) => {
      const matchStatus = statusFilter === 'all' || (ev.status || 'pendente') === statusFilter
      const matchSearch =
        searchTerm === '' ||
        ev.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evo_id?.includes(searchTerm)
      return matchStatus && matchSearch
    })
    return result.sort((a, b) => {
      const statusA = a.status || 'pendente'
      const statusB = b.status || 'pendente'
      return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99)
    })
  }, [evaluations, statusFilter, searchTerm])

  const lateEvals = useMemo(() => {
    const today = startOfDay(new Date())
    return evaluations.filter((ev) => {
      if (ev.status === 'concluido' || ev.is_pre_avaliacao) return false
      const deadlineBase =
        ev.data_avaliacao ||
        (ev.desafio_zander_ativado_em ? ev.desafio_zander_ativado_em.split('T')[0] : null)
      if (!deadlineBase) return false
      const deadline = calculateDeadline(deadlineBase, 3)
      return isAfter(today, deadline)
    })
  }, [evaluations])

  if (initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard do Coordenador</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visão geral de todos os alunos e avaliações.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsNewStudentOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <UserPlus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Aluno</span>
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link to="/evaluation/new">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Nova Avaliação</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExportOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="team">Equipe e Colaboradores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {evaluations.length > 0 && <DashboardCharts data={evaluations} />}

          {professorRequests.length > 0 && (
            <Alert className="mb-6 border-purple-500/50 bg-purple-500/10">
              <UserPlus className="h-5 w-5 text-purple-500" />
              <AlertTitle className="text-lg font-bold text-purple-700 dark:text-purple-400">
                Solicitações de Professores
              </AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-2">
                {professorRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-background p-3 rounded-md border gap-3"
                  >
                    <span className="text-sm">
                      O professor <strong>{req.professor?.nome}</strong> deseja assumir o aluno{' '}
                      <strong>{req.avaliacao?.nome_cliente}</strong>.
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleRespondRequest(
                            req.id,
                            'aprovado',
                            req.avaliacao_id,
                            req.professor_id,
                          )
                        }
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleRespondRequest(
                            req.id,
                            'rejeitado',
                            req.avaliacao_id,
                            req.professor_id,
                          )
                        }
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {lateEvals.length > 0 && (
            <Alert
              variant="destructive"
              className="mb-6 animate-pulse border-destructive/50 bg-destructive/10"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold">Atenção: Avaliações Atrasadas!</AlertTitle>
              <AlertDescription className="text-base">
                O sistema registra <strong>{lateEvals.length}</strong>{' '}
                {lateEvals.length === 1 ? 'avaliação' : 'avaliações'} com prazo de montagem de
                treino expirado (mais de 3 dias úteis).
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno ou EVO..."
                className="pl-9 bg-background w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_progresso">Em Progresso</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((ev) => {
              const today = startOfDay(new Date())
              const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
              const isPre = ev.is_pre_avaliacao

              const deadlineBaseDate =
                ev.data_avaliacao ||
                (ev.desafio_zander_ativado_em ? ev.desafio_zander_ativado_em.split('T')[0] : null)
              const deadline = deadlineBaseDate ? calculateDeadline(deadlineBaseDate, 3) : null

              const isLate =
                !isPre && deadline && isAfter(today, deadline) && ev.status !== 'concluido'
              const links = ev.links_avaliacao?.[0] || {}

              let reevalColorClass = ''
              let reevalDotClass = ''
              let isPulsing = false

              if (!isPre && ev.data_reavaliacao && evalDate) {
                const daysSinceEval = differenceInDays(today, evalDate)
                if (daysSinceEval <= 29) {
                  reevalColorClass = 'text-primary'
                  reevalDotClass = 'bg-primary'
                } else if (daysSinceEval <= 59) {
                  reevalColorClass = 'text-amber-500'
                  reevalDotClass = 'bg-amber-500'
                } else if (daysSinceEval <= 90) {
                  reevalColorClass = 'text-destructive'
                  reevalDotClass = 'bg-destructive'
                } else {
                  reevalColorClass = 'text-destructive font-bold'
                  reevalDotClass = 'bg-destructive'
                  isPulsing = true
                }
              }

              const linkItems = [
                {
                  type: 'external',
                  url: links.mapeamento_sintomas_url,
                  icon: HeartPulse,
                  label: 'Sintomas',
                },
                {
                  type: 'external',
                  url: links.mapeamento_dor_url,
                  icon: Activity,
                  label: 'Dor',
                },
                { type: 'external', url: links.bia_url, icon: Scale, label: 'BIA' },
                { type: 'external', url: links.my_score_url, icon: Target, label: 'My Score' },
              ]

              return (
                <Card
                  key={ev.id}
                  className={cn(
                    'flex flex-col h-full transition-all hover:border-primary/50 overflow-hidden shadow-sm',
                    isPre &&
                      'bg-blue-50/10 dark:bg-blue-900/5 border-blue-200 dark:border-blue-900/50',
                  )}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2 border-b border-border/10">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <CardTitle
                        className="text-base font-bold leading-tight line-clamp-2"
                        title={ev.nome_cliente}
                      >
                        {ev.nome_cliente}
                      </CardTitle>
                      <div className="flex gap-1.5 flex-wrap">
                        {isPre && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-5 px-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-none flex items-center gap-1 w-fit"
                          >
                            <AlertCircle className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 border-primary/30 text-primary/80"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                        {ev.desafio_zander_status &&
                          ev.desafio_zander_status !== 'nenhum' &&
                          ev.status !== 'concluido' && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 border-purple-500/50 text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"
                            >
                              #DesafioZander
                            </Badge>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 -mr-2 -mt-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => setEditCadastroEv(ev)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar Cadastro</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#84cc16] hover:text-[#84cc16] hover:bg-[#84cc16]/10"
                            onClick={() => setEditAvaliacaoEv(ev)}
                          >
                            <FileEdit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar Avaliação</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(ev.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir Cliente</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 flex flex-col gap-4 flex-grow">
                    {/* Infos Grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                          Avaliação
                        </span>
                        <span className="font-medium">
                          {isPre ? '-' : evalDate ? format(evalDate, 'dd/MM/yyyy') : '-'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                          Reavaliação
                        </span>
                        {isPre || !ev.data_reavaliacao ? (
                          <span className="text-muted-foreground font-medium">-</span>
                        ) : (
                          <span
                            className={cn(
                              'font-bold inline-flex items-center gap-1.5',
                              reevalColorClass,
                              isPulsing && 'animate-pulse',
                            )}
                          >
                            <span className={cn('w-2 h-2 rounded-full', reevalDotClass)} />
                            {format(new Date(ev.data_reavaliacao + 'T12:00:00'), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                          Professor
                        </span>
                        <Select
                          value={ev.professor_id || 'unassigned'}
                          onValueChange={(val) => handleProfessorChange(ev.id, val)}
                        >
                          <SelectTrigger className="h-7 text-xs font-semibold px-2 w-full border-dashed bg-transparent">
                            <SelectValue placeholder="Não atribuído" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned" className="text-muted-foreground italic">
                              Não atribuído
                            </SelectItem>
                            {users
                              .filter((u) => u.roles?.includes('professor'))
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                          Período
                        </span>
                        <span className="font-medium">{ev.periodo_treino || '-'}</span>
                      </div>
                    </div>

                    {/* Status & Prazo */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40 mt-auto">
                      <div className="flex-1">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium block mb-1">
                          Status do Treino
                        </span>
                        <Select
                          value={ev.status || 'pendente'}
                          onValueChange={(val) => handleStatusChange(ev.id, val)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 text-xs font-bold w-full',
                              (!ev.status || ev.status === 'pendente') &&
                                'border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400',
                              ev.status === 'em_progresso' &&
                                'border-blue-500/30 text-blue-600 bg-blue-500/10 dark:text-blue-400',
                              ev.status === 'concluido' &&
                                'border-primary/40 text-primary bg-primary/10',
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_progresso">Em Progresso</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium block mb-1">
                          Prazo
                        </span>
                        {isPre || !deadline ? (
                          <span className="text-muted-foreground font-medium">-</span>
                        ) : (
                          <span
                            className={cn(
                              'font-bold text-sm',
                              isLate ? 'text-destructive animate-pulse' : 'text-foreground',
                            )}
                          >
                            {format(deadline, 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex flex-col gap-3 bg-muted/10 border-t border-border/10">
                    {/* Botões de Ação Secundários */}
                    <div className="flex items-center gap-1.5 w-full pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-[1.2] h-8 text-[11px] font-semibold bg-background shadow-sm hover:bg-secondary/50 transition-colors px-0 min-w-0"
                        onClick={() =>
                          setAcompanhamentoEval({
                            id: ev.id,
                            nome: ev.nome_cliente,
                            evo_id: ev.evo_id,
                          })
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:mr-1 text-primary shrink-0" />{' '}
                        <span className="truncate px-1">Anot.</span>
                      </Button>
                      <Button
                        className="flex-[1.5] bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 font-bold text-[11px] h-8 px-0 shadow-sm min-w-0"
                        asChild
                      >
                        <Link to={`/evaluation/${ev.id}`} className="truncate px-1">
                          Avaliação
                        </Link>
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0 text-muted-foreground bg-background shadow-sm hover:text-foreground"
                            onClick={() =>
                              setHistoryEval({
                                id: ev.id,
                                nome: ev.nome_cliente,
                                evo_id: ev.evo_id,
                              })
                            }
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver Histórico</TooltipContent>
                      </Tooltip>
                      {!ev.is_pre_avaliacao && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shrink-0 text-green-600 bg-background shadow-sm hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 border-green-200 dark:border-green-900/50"
                              onClick={() => handleSendWhatsApp(ev)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Enviar links via WhatsApp</TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Botões Desafio Zander */}
                    {(!ev.desafio_zander_status || ev.desafio_zander_status === 'nenhum') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs font-bold border-purple-500/30 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 shadow-sm transition-colors"
                        onClick={() => handleActivateDesafio(ev.id)}
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1.5" /> Ativar #DesafioZander
                      </Button>
                    )}
                    {ev.desafio_zander_status === 'ativo' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs font-bold border-purple-500/50 text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30 shadow-sm animate-pulse transition-colors"
                        onClick={() => handleSendDesafioWhatsApp(ev)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Enviar Whats Desafio
                      </Button>
                    )}
                    {ev.desafio_zander_status === 'enviado' && (
                      <Badge
                        variant="outline"
                        className="w-full h-8 justify-center font-bold border-green-500/50 text-green-700 bg-green-50 dark:bg-green-500/10 dark:text-green-400 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Desafio Aceito
                      </Badge>
                    )}

                    {/* Links Externos / Internos Icons */}
                    <div className="flex justify-center items-center w-full gap-1 pt-3 border-t border-border/40">
                      {linkItems.map((item, idx) => {
                        const Icon = item.icon
                        if (!ev.is_pre_avaliacao && item.url) {
                          return (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                {item.type === 'internal' ? (
                                  <Link
                                    to={item.url}
                                    className="p-1.5 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                  >
                                    <Icon className="w-[18px] h-[18px]" />
                                  </Link>
                                ) : (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                  >
                                    <Icon className="w-[18px] h-[18px]" />
                                  </a>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>{item.label}</TooltipContent>
                            </Tooltip>
                          )
                        }
                        return (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="p-1.5 opacity-20 cursor-not-allowed text-muted-foreground">
                                <Icon className="w-[18px] h-[18px]" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{item.label} (Indisponível)</TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}

            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                <AlertCircle className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <p className="text-base font-medium">Nenhuma avaliação encontrada.</p>
                <p className="text-sm mt-1">Tente ajustar os filtros de status.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="team">
          <UserManagementTab users={users} onUpdate={loadUsers} />
        </TabsContent>
      </Tabs>

      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Exportar Relatório Mensal</DialogTitle>
            <DialogDescription>
              Selecione o mês e o ano para gerar uma planilha em Excel/CSV com as avaliações
              realizadas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={exportMonth} onValueChange={setExportMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Janeiro</SelectItem>
                  <SelectItem value="1">Fevereiro</SelectItem>
                  <SelectItem value="2">Março</SelectItem>
                  <SelectItem value="3">Abril</SelectItem>
                  <SelectItem value="4">Maio</SelectItem>
                  <SelectItem value="5">Junho</SelectItem>
                  <SelectItem value="6">Julho</SelectItem>
                  <SelectItem value="7">Agosto</SelectItem>
                  <SelectItem value="8">Setembro</SelectItem>
                  <SelectItem value="9">Outubro</SelectItem>
                  <SelectItem value="10">Novembro</SelectItem>
                  <SelectItem value="11">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={exportYear} onValueChange={setExportYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(5)].map((_, i) => {
                    const y = (new Date().getFullYear() - i).toString()
                    return (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportCSV}>Baixar Planilha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NovoAlunoDialog
        open={isNewStudentOpen}
        onOpenChange={setIsNewStudentOpen}
        onSuccess={() => {
          setIsNewStudentOpen(false)
          loadData()
        }}
      />

      <AcompanhamentoDialog
        open={!!acompanhamentoEval}
        onOpenChange={(open) => !open && setAcompanhamentoEval(null)}
        avaliacaoId={acompanhamentoEval?.id || ''}
        nomeCliente={acompanhamentoEval?.nome || ''}
        evoId={acompanhamentoEval?.evo_id}
      />

      <HistoryDialog
        open={!!historyEval}
        onOpenChange={(open) => !open && setHistoryEval(null)}
        avaliacaoId={historyEval?.id || ''}
        nomeCliente={historyEval?.nome || ''}
        evoId={historyEval?.evo_id}
      />

      {editCadastroEv && (
        <EditarCadastroDialog
          open={!!editCadastroEv}
          onOpenChange={(open) => {
            if (!open) setEditCadastroEv(null)
          }}
          ev={editCadastroEv}
        />
      )}
      {editAvaliacaoEv && (
        <EditarAvaliacaoDialog
          open={!!editAvaliacaoEv}
          onOpenChange={(open) => {
            if (!open) setEditAvaliacaoEv(null)
          }}
          ev={editAvaliacaoEv}
        />
      )}
    </div>
  )
}
