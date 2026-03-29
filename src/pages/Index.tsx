import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { format, isAfter, startOfDay, differenceInDays } from 'date-fns'
import {
  FileText,
  Plus,
  UserPlus,
  Search,
  Loader2,
  MessageSquare,
  HeartPulse,
  Activity,
  Scale,
  Target,
  AlertCircle,
  Edit,
  History,
  MessageCircle,
} from 'lucide-react'
import { getEvaluations } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { HistoryDialog } from '@/components/HistoryDialog'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0
  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }
  return result
}

export default function Index() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
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

  const { toast } = useToast()
  const { profile, loading: authLoading } = useAuth()

  const loadData = useCallback(async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setInitialLoading(false)
    }
  }, [toast])

  const profileId = profile?.id
  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])
  const isCoordenador = userRoles.includes('coordenador')
  const canCreateEval = userRoles.includes('avaliador') || isCoordenador
  const canCreatePre = userRoles.includes('professor') || isCoordenador

  useEffect(() => {
    if (!authLoading && profileId) {
      loadData()
    } else if (!authLoading && !profileId) {
      setInitialLoading(false)
    }
  }, [authLoading, profileId, loadData])

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

    let linksStr = ''
    if (links.anamnese_url) linksStr += `📝 *Anamnese:* ${links.anamnese_url}\n`
    if (links.mapeamento_sintomas_url)
      linksStr += `🔍 *Sintomas:* ${links.mapeamento_sintomas_url}\n`
    if (links.mapeamento_dor_url) linksStr += `🎯 *Dor:* ${links.mapeamento_dor_url}\n`
    if (links.bia_url) linksStr += `⚖️ *BIA:* ${links.bia_url}\n`
    if (links.my_score_url) linksStr += `📊 *My Score:* ${links.my_score_url}\n`

    try {
      const { data: tpl } = await supabase
        .from('message_templates')
        .select('template')
        .eq('id', 'links_avaliacao')
        .single()
      let text =
        tpl?.template ||
        `Olá, {{nome}}, tudo bem?\n\nAbaixo estão os links da sua avaliação:\n\n{{links}}\n\nMuito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! 💙`

      text = text.replace(/{{nome}}/g, firstName).replace(/{{links}}/g, linksStr.trim())

      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
      toast({ title: 'WhatsApp Aberto', description: 'A janela do WhatsApp foi aberta.' })
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return evaluations
    const lower = search.toLowerCase()
    return evaluations.filter(
      (ev) =>
        ev.nome_cliente.toLowerCase().includes(lower) ||
        (ev.evo_id && ev.evo_id.toLowerCase().includes(lower)),
    )
  }, [evaluations, search])

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Início - Todos os Alunos</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de todos os alunos cadastrados na academia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreatePre && (
            <Button variant="outline" onClick={() => setIsNewStudentOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          )}
          {canCreateEval && (
            <Button asChild>
              <Link to="/evaluation/new">
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou ID EVO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((ev) => {
          const today = startOfDay(new Date())
          const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
          const isPre = ev.is_pre_avaliacao || !ev.data_avaliacao
          const isDesafio = ev.desafio_zander_status?.trim().toLowerCase() === 'ativo'

          let deadlineStr = ev.data_avaliacao
          let prazoTreino: Date | null = null

          if (isDesafio) {
            const baseDate = ev.desafio_zander_ativado_em || ev.created_at || ev.data_avaliacao
            if (baseDate) {
              const safeDate = baseDate.includes('T') ? baseDate : baseDate.replace(' ', 'T')
              const parsed = new Date(safeDate)
              if (!isNaN(parsed.getTime())) {
                prazoTreino = addBusinessDays(parsed, 3)
              } else {
                prazoTreino = addBusinessDays(new Date(), 3)
              }
            } else {
              prazoTreino = addBusinessDays(new Date(), 3)
            }
          } else if (deadlineStr && !ev.is_pre_avaliacao) {
            const safeDate = deadlineStr.includes('T') ? deadlineStr : deadlineStr + 'T12:00:00'
            const parsed = new Date(safeDate)
            if (!isNaN(parsed.getTime())) {
              prazoTreino = addBusinessDays(parsed, 3)
            }
          }

          const isLate =
            ((!isPre && prazoTreino) || (isDesafio && prazoTreino)) &&
            prazoTreino &&
            isAfter(today, prazoTreino) &&
            ev.status !== 'concluido'

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
              type: 'internal',
              url: `/evaluation/${ev.id}`,
              icon: FileText,
              label: 'Resumo da Avaliação',
            },
            {
              type: 'external',
              url: links.mapeamento_sintomas_url,
              icon: HeartPulse,
              label: 'Mapeamento Sintomas',
            },
            {
              type: 'external',
              url: links.mapeamento_dor_url,
              icon: Activity,
              label: 'Mapeamento da Dor',
            },
            { type: 'external', url: links.bia_url, icon: Scale, label: 'BIA' },
            { type: 'external', url: links.my_score_url, icon: Target, label: 'My Score' },
          ]

          return (
            <Card
              key={ev.id}
              className={cn(
                'flex flex-col h-full transition-all hover:border-primary/50 overflow-hidden',
                ev.is_pre_avaliacao && 'bg-primary/5',
              )}
            >
              <CardContent className="p-4 flex flex-col h-full gap-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base leading-tight" title={ev.nome_cliente}>
                      {ev.nome_cliente}
                    </h3>
                    <div className="flex gap-1">
                      {!ev.is_pre_avaliacao && isCoordenador && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-accent hover:bg-accent/20 hover:text-accent -mt-1 -mr-1"
                              onClick={() => handleSendWhatsApp(ev)}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Enviar links via WhatsApp</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground -mt-1 -mr-1"
                            onClick={() =>
                              setHistoryEval({
                                id: ev.id,
                                nome: ev.nome_cliente,
                                evo_id: ev.evo_id,
                              })
                            }
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver Histórico</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  {ev.evo_id && (
                    <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                      EVO: {ev.evo_id}
                    </div>
                  )}
                  <div className="flex gap-1.5 items-center flex-wrap mt-2">
                    {ev.is_pre_avaliacao && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-2 py-0 border-none h-5 flex items-center gap-1 w-fit"
                      >
                        <AlertCircle className="w-3 h-3" /> Pendente
                      </Badge>
                    )}
                    {isDesafio && (
                      <Badge
                        variant="default"
                        className="text-[10px] px-1.5 py-0 border-none h-5 bg-purple-600 hover:bg-purple-700 text-white w-fit"
                      >
                        #DesafioZander
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Data Avaliação
                    </span>
                    <span className="font-medium">
                      {evalDate ? format(evalDate, 'dd/MM/yyyy') : '-'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Reavaliação
                    </span>
                    {isPre || !ev.data_reavaliacao ? (
                      <span className="font-medium text-muted-foreground">-</span>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          reevalColorClass,
                          isPulsing && 'animate-pulse',
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', reevalDotClass)} />
                        <span className="font-medium">
                          {format(new Date(ev.data_reavaliacao + 'T12:00:00'), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Período
                    </span>
                    <span className="font-medium">{ev.periodo_treino || '-'}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Prazo (Treino)
                    </span>
                    {(!isDesafio && isPre) || !prazoTreino ? (
                      <span className="font-medium">-</span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${isLate ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
                          />
                          {format(prazoTreino, 'dd/MM/yyyy')}
                        </div>
                        {isDesafio ? (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            #DesafioZander
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            3 dias úteis
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Professor
                    </span>
                    {ev.professor?.nome ? (
                      <Badge className="bg-[#95c23d] text-black hover:bg-[#95c23d]/90 border-none font-semibold px-2 py-0 w-fit h-5">
                        {ev.professor.nome.split(' ')[0]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-medium">-</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                      Treino
                    </span>
                    <div
                      className={cn(
                        'flex items-center justify-between w-full h-7 text-xs font-semibold px-2 rounded-md border',
                        (!ev.status || ev.status === 'pendente') &&
                          'border-amber-500/30 text-amber-500 bg-amber-500/10',
                        ev.status === 'em_progresso' &&
                          'border-blue-500/30 text-blue-500 bg-blue-500/10',
                        ev.status === 'concluido' && 'border-primary/30 text-primary bg-primary/10',
                      )}
                    >
                      <span>
                        {ev.status === 'pendente'
                          ? 'Pendente'
                          : ev.status === 'em_progresso'
                            ? 'Em Progresso'
                            : ev.status === 'concluido'
                              ? 'Concluído'
                              : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-md border border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground ml-1 mr-auto uppercase tracking-wider">
                      Links
                    </span>
                    {linkItems.map((item, idx) => {
                      const Icon = item.icon
                      if (!ev.is_pre_avaliacao && item.url) {
                        return (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              {item.type === 'internal' ? (
                                <Link
                                  to={item.url}
                                  className="p-1 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                >
                                  <Icon className="w-4 h-4" />
                                </Link>
                              ) : (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                >
                                  <Icon className="w-4 h-4" />
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
                            <div className="p-1 opacity-30 cursor-not-allowed">
                              <Icon className="w-4 h-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{item.label} (Indisponível)</TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex-1 font-medium bg-secondary/30"
                      onClick={() =>
                        setAcompanhamentoEval({
                          id: ev.id,
                          nome: ev.nome_cliente,
                          evo_id: ev.evo_id,
                        })
                      }
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Anotações
                    </Button>
                    <Button variant="default" size="sm" className="h-8 text-xs flex-1" asChild>
                      <Link to={`/evaluation/${ev.id}`}>Ver Resumo</Link>
                    </Button>
                    {canCreateEval && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-primary hover:text-primary hover:bg-primary/20 border-primary/20"
                            asChild
                          >
                            <Link to={`/evaluation/edit/${ev.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar Avaliação</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

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
    </div>
  )
}
