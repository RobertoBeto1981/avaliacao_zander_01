import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { FileText, Plus, UserPlus, Search, Loader2, Link2, MessageSquare } from 'lucide-react'
import { getEvaluations } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { cn } from '@/lib/utils'

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
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<any>(null)
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

  useEffect(() => {
    if (!authLoading && profileId) {
      loadData()
    } else if (!authLoading && !profileId) {
      setInitialLoading(false)
    }
  }, [authLoading, profileId, loadData])

  const filtered = useMemo(() => {
    if (!search) return evaluations
    const lower = search.toLowerCase()
    return evaluations.filter(
      (ev) =>
        ev.nome_cliente.toLowerCase().includes(lower) ||
        (ev.evo_id && ev.evo_id.toLowerCase().includes(lower)),
    )
  }, [evaluations, search])

  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])
  const canCreateEval = userRoles.includes('avaliador') || userRoles.includes('coordenador')
  const canCreatePre = userRoles.includes('professor')

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

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Data Avaliação</TableHead>
              <TableHead>Prazo (Treino)</TableHead>
              <TableHead>Professor Resp.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Links</TableHead>
              <TableHead className="text-center">Acomp.</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T00:00:00') : null
              const isDesafio = ev.desafio_zander_status === 'ativo'
              let prazoTreino =
                evalDate && !ev.is_pre_avaliacao ? addBusinessDays(evalDate, 3) : null

              if (isDesafio && ev.desafio_zander_ativado_em) {
                prazoTreino = addBusinessDays(new Date(ev.desafio_zander_ativado_em), 3)
              } else if (isDesafio && ev.created_at) {
                prazoTreino = addBusinessDays(new Date(ev.created_at), 3)
              }

              const links = ev.links_avaliacao?.[0]
              const hasLinks =
                links &&
                (links.anamnese_url ||
                  links.mapeamento_sintomas_url ||
                  links.mapeamento_dor_url ||
                  links.bia_url ||
                  links.my_score_url ||
                  links.relatorio_pdf_url)

              return (
                <TableRow
                  key={ev.id}
                  className={cn('hover:bg-muted/30', ev.is_pre_avaliacao && 'bg-primary/5')}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1.5">
                      <span>{ev.nome_cliente}</span>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {ev.is_pre_avaliacao && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                            Pré-Avaliação
                          </Badge>
                        )}
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {evalDate && !ev.is_pre_avaliacao ? format(evalDate, 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {prazoTreino ? (
                      <div className="flex flex-col gap-0.5 items-start">
                        <span className="font-medium text-amber-600 dark:text-amber-500">
                          {format(prazoTreino, 'dd/MM/yyyy')}
                        </span>
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
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ev.professor?.nome ? (
                      <Badge
                        variant="outline"
                        className="font-normal bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                      >
                        {ev.professor.nome}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ev.status === 'concluido'
                          ? 'default'
                          : ev.status === 'em_progresso'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {ev.status === 'pendente'
                        ? 'Pendente'
                        : ev.status === 'em_progresso'
                          ? 'Em Progresso'
                          : ev.status === 'concluido'
                            ? 'Concluído'
                            : ev.status || 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {hasLinks ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {links.anamnese_url && (
                            <DropdownMenuItem onClick={() => window.open(links.anamnese_url)}>
                              Anamnese
                            </DropdownMenuItem>
                          )}
                          {links.mapeamento_sintomas_url && (
                            <DropdownMenuItem
                              onClick={() => window.open(links.mapeamento_sintomas_url)}
                            >
                              Sintomas
                            </DropdownMenuItem>
                          )}
                          {links.mapeamento_dor_url && (
                            <DropdownMenuItem onClick={() => window.open(links.mapeamento_dor_url)}>
                              Mapa de Dor
                            </DropdownMenuItem>
                          )}
                          {links.bia_url && (
                            <DropdownMenuItem onClick={() => window.open(links.bia_url)}>
                              BIA
                            </DropdownMenuItem>
                          )}
                          {links.my_score_url && (
                            <DropdownMenuItem onClick={() => window.open(links.my_score_url)}>
                              My Score
                            </DropdownMenuItem>
                          )}
                          {links.relatorio_pdf_url && (
                            <DropdownMenuItem onClick={() => window.open(links.relatorio_pdf_url)}>
                              Relatório PDF
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                      onClick={() => setAcompanhamentoEval(ev)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/evaluation/${ev.id}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Resumo
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

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
        nomeCliente={acompanhamentoEval?.nome_cliente || ''}
        evoId={acompanhamentoEval?.evo_id}
      />
    </div>
  )
}
