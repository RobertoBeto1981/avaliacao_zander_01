import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReavaliacaoById } from '@/services/reavaliacoes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ArrowLeft,
  MessageCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ReevaluationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const canSendWhatsApp = profile?.role === 'coordenador' || profile?.role === 'avaliador'

  useEffect(() => {
    if (!id) return
    getReavaliacaoById(id)
      .then(setData)
      .catch((err) => {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id, toast, navigate])

  const handleSendWhatsApp = () => {
    if (!data?.avaliacao?.telefone_cliente) {
      toast({
        title: 'Telefone indisponível',
        description: 'O cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }
    let phone = data.avaliacao.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const text = `Olá ${data.avaliacao.nome_cliente.split(' ')[0]}, segue o seu Relatório de Evolução! (Por favor, anexe o PDF gerado)`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleGeneratePDF = () => {
    toast({ title: 'PDF', description: 'Gerando relatório PDF de evolução...' })
    setTimeout(() => {
      toast({ title: 'Sucesso', description: 'Relatório PDF de Evolução gerado (Simulação).' })
    }, 1500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Detalhes da Reavaliação
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.avaliacao?.nome_cliente} -{' '}
              {format(new Date(data.data_reavaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGeneratePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          {canSendWhatsApp && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSendWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Evolução do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          {data.evolucao && data.evolucao.length > 0 ? (
            <div className="space-y-4">
              {data.evolucao.map((ev: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/30 gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{ev.campo}</h4>
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <div className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-medium line-through opacity-70">
                        {ev.de || 'N/A'}
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {ev.para || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {ev.status === 'melhorou' && (
                      <span className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        <TrendingUp className="w-4 h-4 mr-1.5" /> Melhorou
                      </span>
                    )}
                    {ev.status === 'piorou' && (
                      <span className="flex items-center text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        <TrendingDown className="w-4 h-4 mr-1.5" /> Piorou
                      </span>
                    )}
                    {ev.status === 'manteve' && (
                      <span className="flex items-center text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        <Minus className="w-4 h-4 mr-1.5" /> Manteve
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              Nenhuma alteração significativa registrada nesta reavaliação.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Novas Respostas (Anamnese)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.respostas_novas || {}).map(([key, value]) => {
              if (!value || (typeof value === 'object' && Object.keys(value).length === 0))
                return null

              let displayValue = String(value)
              if (typeof value === 'boolean') displayValue = value ? 'Sim' : 'Não'
              if (Array.isArray(value)) displayValue = value.join(', ')
              if (typeof value === 'object' && !Array.isArray(value)) {
                const obj = value as any
                if (obj.choice !== undefined) {
                  displayValue = `${obj.choice === true ? 'Sim' : obj.choice === false ? 'Não' : obj.choice}`
                  if (
                    obj.list ||
                    obj.reason ||
                    obj.amount ||
                    obj.other ||
                    obj.observation ||
                    obj.notes
                  ) {
                    displayValue += ` - ${obj.list || obj.reason || obj.amount || obj.other || obj.observation || obj.notes}`
                  }
                } else if (obj.choices) {
                  displayValue = obj.choices.join(', ')
                  if (obj.list) displayValue += ` - ${obj.list}`
                } else {
                  displayValue = JSON.stringify(value)
                }
              }

              return (
                <div
                  key={key}
                  className="p-4 bg-background border border-border/50 rounded-lg shadow-sm"
                >
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="font-medium text-sm text-foreground">{displayValue}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
