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

function addWorkingDays(startDate: Date, days: number) {
  const date = new Date(startDate)
  let addedDays = 0
  while (addedDays < days) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      // Skip Sunday(0) and Saturday(6)
      addedDays++
    }
  }
  return date
}

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
      <CardContent className="p-4 bg-muted/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full flex justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-background">
              Nenhum registro encontrado com os filtros atuais.
            </div>
          ) : (
            data.map((ev) => {
              const status = ev.status || 'pendente'
              const isPre = ev.is_pre_avaliacao

              return (
                <Card
                  key={ev.id}
                  className={cn(
                    'flex flex-col h-full transition-all hover:border-primary/50 overflow-hidden bg-background shadow-sm',
                    isPre &&
                      'bg-blue-50/10 dark:bg-blue-900/5 border-blue-200 dark:border-blue-900/50',
                  )}
                >
                  <CardContent className="p-4 flex flex-col h-full gap-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-base leading-tight" title={ev.nome_cliente}>
                          {ev.nome_cliente}
                        </h3>
                        {!hideActions && (
                          <div className="flex gap-1 shrink-0 -mt-1 -mr-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary hover:bg-primary/10"
                              asChild
                            >
                              <Link to={`/evaluation/edit/${ev.id}`} title="Editar">
                                <Edit className="w-3.5 h-3.5" />
                              </Link>
                            </Button>
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(ev.id)}
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {ev.evo_id && (
                        <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                          EVO: {ev.evo_id}
                        </div>
                      )}
                      <div className="flex gap-1.5 items-center flex-wrap mt-2">
                        {isPre && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-5 px-2 py-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-none flex items-center gap-1 w-fit"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Nova Avaliação Pendente
                          </Badge>
                        )}
                        {ev.desafio_zander_status?.trim().toLowerCase() === 'ativo' && (
                          <Badge
                            variant="default"
                            className="text-[10px] h-5 px-1.5 py-0 bg-purple-600 text-white hover:bg-purple-700 border-none flex items-center w-fit"
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
                          {isPre || !ev.data_avaliacao ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')
                          )}
                        </span>
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
                        {ev.desafio_zander_status?.trim().toLowerCase() === 'ativo' ? (
                          <div className="flex flex-col gap-0.5 items-start">
                            <span className="font-semibold text-purple-700 dark:text-purple-400">
                              {ev.desafio_zander_ativado_em
                                ? format(
                                    addWorkingDays(new Date(ev.desafio_zander_ativado_em), 3),
                                    'dd/MM/yyyy',
                                  )
                                : format(addWorkingDays(new Date(ev.created_at), 3), 'dd/MM/yyyy')}
                            </span>
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              #DesafioZander
                            </span>
                          </div>
                        ) : ev.data_avaliacao && !isPre ? (
                          <span className="font-medium text-foreground">
                            {format(
                              addWorkingDays(new Date(ev.data_avaliacao + 'T00:00:00'), 3),
                              'dd/MM/yyyy',
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">-</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                          Professor Resp.
                        </span>
                        {ev.professor?.nome ? (
                          <Badge className="bg-[#95c23d] text-black hover:bg-[#95c23d]/90 border-none font-semibold px-2 py-0 w-fit h-5">
                            {ev.professor.nome.split(' ')[0]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground font-medium">-</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-border/40">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">
                          Status do Treino
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-semibold w-fit h-6 px-3',
                            status === 'pendente' &&
                              'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30',
                            status === 'em_progresso' &&
                              'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30',
                            status === 'concluido' &&
                              'border-primary/50 text-primary bg-primary/10',
                          )}
                        >
                          {status === 'em_progresso'
                            ? 'Em Progresso'
                            : status === 'concluido'
                              ? 'Concluído'
                              : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
