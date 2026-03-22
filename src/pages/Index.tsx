import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { FilePlus2, Search, User, Eye } from 'lucide-react'
import { getEvaluations } from '@/services/evaluations'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  const filtered = evaluations.filter((e) =>
    e.nome_cliente.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading || loadingData)
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const canCreateEvaluation = profile && ['avaliador', 'coordenador'].includes(profile.role)

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Avaliações Físicas</h1>
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
                    <div className="flex flex-col gap-1">
                      <span>{ev.nome_cliente}</span>
                      {ev.is_pre_avaliacao && (
                        <Badge
                          variant="secondary"
                          className="w-fit text-[10px] h-4 px-1.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none"
                        >
                          Pré-Avaliação
                        </Badge>
                      )}
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
                    <Button variant="ghost" size="icon" asChild title="Visualizar Avaliação">
                      <Link to={`/evaluation/${ev.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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
