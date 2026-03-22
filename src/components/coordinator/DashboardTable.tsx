import { format } from 'date-fns'
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
import { ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardTable({ data }: { data: any[] }) {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                      <div className="flex flex-col gap-1">
                        <span>{ev.nome_cliente}</span>
                        {isPre && (
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px] h-4 px-1.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none"
                          >
                            Pré-Avaliação
                          </Badge>
                        )}
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
                          status === 'concluido' &&
                            'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30',
                        )}
                      >
                        {status === 'em_progresso'
                          ? 'Em Progresso'
                          : status === 'concluido'
                            ? 'Concluído'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
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
