import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  MessageSquare,
  Edit,
  Activity,
  Scale,
  FileText,
  HeartPulse,
  Target,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface StudentCardProps {
  ev: any
  currentUserRoles: string[]
  currentUserId: string
  onStatusChange: (id: string, status: string) => void
  onAnotacoesClick: (ev: any) => void
  onHistoricoClick: (ev: any) => void
}

export function StudentCard({
  ev,
  currentUserRoles,
  currentUserId,
  onStatusChange,
  onAnotacoesClick,
  onHistoricoClick,
}: StudentCardProps) {
  const isCoordenador = currentUserRoles.includes('coordenador')
  const isProfessor = currentUserRoles.includes('professor')
  const isAvaliador = currentUserRoles.includes('avaliador')

  // Regra: Professor edita apenas situação "TREINO" se o aluno foi distribuído para ele
  const canEditTreino = isCoordenador || (isProfessor && ev.professor_id === currentUserId)

  // Regra: Avaliador/Nutri/Fisio só pode editar o cadastro se ele próprio incluiu o aluno (avaliador_id)
  const isCreator = ev.avaliador_id === currentUserId || ev.user_id === currentUserId

  // Regra: O botão Editar fica ativo se o usuário tiver permissão, senão inativo (não desaparece)
  const canEditButton = isCoordenador || isProfessor || isCreator

  const links = ev.links_avaliacao?.[0] || {}
  const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
  const reevalDate = ev.data_reavaliacao ? new Date(ev.data_reavaliacao + 'T12:00:00') : null

  // Simulação de cálculo de prazo (+3 dias úteis) para refletir o design solicitado
  let prazoTreino = null
  if (evalDate) {
    prazoTreino = addDays(evalDate, 3)
  }

  return (
    <Card className="flex flex-col h-full bg-[#3f3f46] border-[#52525b] text-white shadow-lg overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle
            className="text-[15px] font-bold uppercase tracking-wide truncate text-white"
            title={ev.nome_cliente}
          >
            {ev.nome_cliente}
          </CardTitle>
          <div className="text-[#84cc16] text-sm font-bold">
            {ev.nao_cliente ? 'NÃO CLIENTE' : ev.evo_id ? `EVO: ${ev.evo_id}` : 'EVO: -'}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700 shrink-0"
              onClick={() => onHistoricoClick(ev)}
            >
              <Clock className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver Histórico</TooltipContent>
        </Tooltip>
      </CardHeader>

      <CardContent className="p-4 pt-4 flex-grow text-sm grid grid-cols-2 gap-y-5 gap-x-2">
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              DATA AVALIAÇÃO
            </span>
            <span className="font-bold text-white text-[15px]">
              {evalDate ? format(evalDate, 'dd/MM/yyyy') : '-'}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              PERÍODO
            </span>
            <span className="font-bold text-white text-[15px] capitalize">
              {ev.periodo_treino || '-'}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1.5">
              PROFESSOR
            </span>
            {ev.professor ? (
              <span className="bg-[#84cc16] text-zinc-900 px-2.5 py-0.5 text-xs font-bold rounded-full">
                {ev.professor.nome?.split(' ')[0]}
              </span>
            ) : (
              <span className="text-zinc-500 font-bold">-</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              REAVALIAÇÃO
            </span>
            <div className="flex items-center gap-1.5 font-bold text-[#84cc16] text-[15px]">
              <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
              {reevalDate ? format(reevalDate, 'dd/MM/yyyy') : '-'}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              PRAZO (TREINO)
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-[#84cc16] text-[15px]">
                <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
                {prazoTreino ? format(prazoTreino, 'dd/MM/yyyy') : '-'}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium mt-0.5">3 dias úteis</span>
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1.5">
              TREINO
            </span>
            <Select
              value={ev.status || 'pendente'}
              onValueChange={(val) => onStatusChange(ev.id, val)}
              disabled={!canEditTreino}
            >
              <SelectTrigger
                className={cn(
                  'h-7 text-[12px] font-bold w-full rounded-md border',
                  (!ev.status || ev.status === 'pendente') &&
                    'border-amber-500/50 text-amber-500 bg-transparent',
                  ev.status === 'em_progresso' && 'border-blue-500/50 text-blue-400 bg-blue-500/10',
                  ev.status === 'concluido' && 'border-[#84cc16]/50 text-[#84cc16] bg-[#84cc16]/10',
                  !canEditTreino && 'opacity-60 cursor-not-allowed',
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
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full bg-zinc-800/50 p-2 rounded-md border border-zinc-700/50">
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest pl-2">LINKS</span>
          <div className="flex items-center gap-1.5 pr-1">
            <LinkIcon
              href={links.anamnese_url}
              icon={<FileText className="w-4 h-4" />}
              tooltip="Anamnese"
            />
            <LinkIcon
              href={links.mapeamento_sintomas_url}
              icon={<HeartPulse className="w-4 h-4" />}
              tooltip="Sintomas"
            />
            <LinkIcon
              href={links.mapeamento_dor_url}
              icon={<Activity className="w-4 h-4" />}
              tooltip="Dor"
            />
            <LinkIcon href={links.bia_url} icon={<Scale className="w-4 h-4" />} tooltip="BIA" />
            <LinkIcon
              href={links.my_score_url}
              icon={<Target className="w-4 h-4" />}
              tooltip="My Score"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full pt-1">
          <Button
            variant="outline"
            className="flex-[1.2] bg-zinc-700 hover:bg-zinc-600 border-zinc-600 text-white font-bold text-xs h-9 px-0"
            onClick={() => onAnotacoesClick(ev)}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            Anotações
          </Button>

          <Button
            className="flex-[1.5] bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 font-bold text-xs h-9 px-0"
            asChild
          >
            <Link to={`/evaluation/${ev.id}`}>Ver Resumo</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              'flex-[0.5] h-9 border-[#84cc16] text-[#84cc16] bg-transparent hover:bg-[#84cc16]/10',
              !canEditButton && 'opacity-40 cursor-not-allowed grayscale',
            )}
            asChild={canEditButton}
            onClick={(e) => {
              if (!canEditButton) e.preventDefault()
            }}
          >
            {canEditButton ? (
              <Link to={`/evaluation/edit/${ev.id}`}>
                <Edit className="w-4 h-4" />
              </Link>
            ) : (
              <button type="button" disabled>
                <Edit className="w-4 h-4" />
              </button>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function LinkIcon({
  href,
  icon,
  tooltip,
}: {
  href?: string
  icon: React.ReactNode
  tooltip: string
}) {
  const isActive = !!href
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href || '#'}
          target={isActive ? '_blank' : undefined}
          rel={isActive ? 'noreferrer' : undefined}
          className={cn(
            'p-1.5 rounded transition-colors flex items-center justify-center',
            isActive ? 'text-[#84cc16] hover:bg-[#84cc16]/20' : 'text-zinc-600 cursor-not-allowed',
          )}
          onClick={(e) => {
            if (!isActive) e.preventDefault()
          }}
        >
          {icon}
        </a>
      </TooltipTrigger>
      {isActive && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  )
}
