import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { FilePlus2, Search, User, Eye, AlertCircle, MessageSquare } from 'lucide-react'
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
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'

export default function RoleDashboard() {
  const { profile, loading } = useAuth()
  const location = useLocation()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<any>(null)

  const roleName = location.pathname.replace('/', '')
  const title = `Painel do ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}`

  useEffect(() => {
    if (profile) {
      getEvaluations().then((data) => {
        const myData =
          profile.role === 'coordenador'
            ? data
            : data.filter(
                (ev: any) => ev.avaliador_id === profile.id || ev.professor_id === profile.id,
              )
        setEvaluations(myData)
        setLoadingData(false)
      })
    }
  }, [profile])

  if (loading || loadingData)
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const filtered = evaluations.filter((e) =>
    e.nome_cliente.toLowerCase().includes(search.toLowerCase()),
  )

  const canCreateEvaluation = roleName === 'avaliador'

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
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
            <h3 className="text-xl font-medium mb-2">Nenhum cliente encontrado</h3>
            <p>Seus clientes cadastrados ou atribuídos aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data da Avaliação</TableHead>
                <TableHead>Professor Resp.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ev) => (
                <TableRow
                  key={ev.id}
                  className={cn('hover:bg-muted/30', ev.is_pre_avaliacao && 'bg-primary/5')}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="line-clamp-1">{ev.nome_cliente}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-primary/30 text-primary/80"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                        {ev.is_pre_avaliacao && (
                          <Badge
                            variant="destructive"
                            className="w-fit text-[10px] px-2 py-0 border-none flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ev.is_pre_avaliacao || !ev.data_avaliacao
                      ? '-'
                      : format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{ev.professor?.nome || '-'}</TableCell>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() =>
                          setAcompanhamentoEval({
                            id: ev.id,
                            nome: ev.nome_cliente,
                            evo_id: ev.evo_id,
                          })
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Anotações
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/20"
                            asChild
                          >
                            <Link to={`/evaluation/${ev.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Visualizar Avaliação</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AcompanhamentoDialog
        open={!!acompanhamentoEval}
        onOpenChange={(open) => !open && setAcompanhamentoEval(null)}
        avaliacaoId={acompanhamentoEval?.id || ''}
        nomeCliente={acompanhamentoEval?.nome || ''}
        evoId={acompanhamentoEval?.evo_id}
      />
    </div>
  )
}
