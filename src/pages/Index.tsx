import { useEffect, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { FilePlus2, Search, User, Eye, AlertCircle, Repeat } from 'lucide-react'
import { getEvaluations } from '@/services/evaluations'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function Index() {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !session) navigate('/login')
  }, [session, loading, navigate])

  useEffect(() => {
    if (session) {
      getEvaluations().then((data) => {
        setEvaluations(data)
        setLoadingData(false)
      })
    }
  }, [session])

  if (loading || loadingData)
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  // Redirect professors directly to their dashboard when accessing home
  if (profile?.role === 'professor') {
    return <Navigate to="/professor" replace />
  }

  const filtered = evaluations.filter((e) =>
    e.nome_cliente.toLowerCase().includes(search.toLowerCase()),
  )

  const canCreateEvaluation = profile && ['avaliador', 'coordenador'].includes(profile.role)
  const title = profile?.role === 'avaliador' ? 'Painel do Avaliador' : 'Avaliações Físicas'

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {canCreateEvaluation && (
          <Button asChild size="lg" className="font-bold">
            <Link to="/evaluation/new">
              <FilePlus2 className="mr-2" /> Nova Avaliação
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 max-w-sm">
        <Search className="text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar por nome do cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed bg-transparent mt-8">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">Nenhuma avaliação encontrada</h3>
            {canCreateEvaluation && <p>Clique em "Nova Avaliação" para começar.</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/50">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Avaliador</TableHead>
                <TableHead>Professor Resp.</TableHead>
                <TableHead>Data da Avaliação</TableHead>
                <TableHead>Reavaliação</TableHead>
                <TableHead>Treino</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ev) => (
                <TableRow
                  key={ev.id}
                  className={cn(
                    'hover:bg-muted/20',
                    ev.is_pre_avaliacao && 'bg-blue-50/20 dark:bg-blue-900/10',
                  )}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="line-clamp-1" title={ev.nome_cliente}>
                        {ev.nome_cliente}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-700"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                        {ev.is_pre_avaliacao && (
                          <Badge
                            variant="destructive"
                            className="w-fit text-[10px] px-2 py-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-none flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ev.avaliador?.nome || '-'}</TableCell>
                  <TableCell>{ev.professor?.nome || '-'}</TableCell>
                  <TableCell>
                    {ev.is_pre_avaliacao ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')
                    )}
                  </TableCell>
                  <TableCell className="text-accent font-semibold">
                    {ev.is_pre_avaliacao ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      format(new Date(ev.data_reavaliacao + 'T00:00:00'), 'dd/MM/yyyy')
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
                      {ev.status === 'em_progresso'
                        ? 'Em Progresso'
                        : ev.status === 'concluido'
                          ? 'Concluído'
                          : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/evaluation/${ev.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Visualizar Avaliação</TooltipContent>
                      </Tooltip>

                      {canCreateEvaluation && !ev.is_pre_avaliacao && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              asChild
                            >
                              <Link to={`/evaluation/${ev.id}/reevaluate`}>
                                <Repeat className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Realizar Reavaliação</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
