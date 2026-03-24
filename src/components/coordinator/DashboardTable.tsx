import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListFilter, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardTable({
  data,
  onDelete,
  hideActions = false,
}: {
  data: any[]
  onDelete?: (id: string) => void
  hideActions?: boolean
}) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center gap-2 py-4">
        <ListFilter className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Listagem de Avaliações ({data.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="w-[30%]">Nome do Cliente</TableHead>
              <TableHead>Data da Avaliação</TableHead>
              <TableHead>Professor Resp.</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Treino</TableHead>
              {!hideActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hideActions ? 5 : 6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum registro encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              data.map((ev) => {
                const status = ev.status || 'pendente'
                const isPre = ev.is_pre_avaliacao

                return (
                  <TableRow
                    key={ev.id}
                    className={cn(
                      'hover:bg-muted/30',
                      isPre && 'bg-blue-50/20 dark:bg-blue-900/10',
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span>{ev.nome_cliente}</span>
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {isPre && (
                            <Badge
                              variant="destructive"
                              className="w-fit text-[10px] h-5 px-2 py-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-none flex items-center gap-1.5"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Nova Avaliação Pendente
                            </Badge>
                          )}
                          {ev.evo_id && (
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] h-5 px-2 py-0 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400 flex items-center"
                            >
                              EVO: {ev.evo_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPre ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')
                      )}
                    </TableCell>
                    <TableCell>
                      {ev.professor?.nome || (
                        <span className="text-muted-foreground italic">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>{ev.periodo_treino || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-semibold',
                          status === 'pendente' &&
                            'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30',
                          status === 'em_progresso' &&
                            'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30',
                          status === 'concluido' && 'border-primary/50 text-primary bg-primary/10',
                        )}
                      >
                        {status === 'em_progresso'
                          ? 'Em Progresso'
                          : status === 'concluido'
                            ? 'Concluído'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
                    {!hideActions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            asChild
                          >
                            <Link to={`/evaluation/edit/${ev.id}`} title="Editar">
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDelete(ev.id)}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
