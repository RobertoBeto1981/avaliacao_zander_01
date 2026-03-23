import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvaluationById } from '@/services/evaluations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, MessageCircle, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EvaluationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const canSendWhatsApp = profile?.role === 'coordenador' || profile?.role === 'avaliador'

  useEffect(() => {
    if (!id) return
    getEvaluationById(id)
      .then(setData)
      .catch((err) => {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id, toast, navigate])

  const handleSendWhatsApp = () => {
    if (!data?.telefone_cliente) {
      toast({
        title: 'Telefone indisponível',
        description: 'O cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }
    let phone = data.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const pdfUrl = data.links_avaliacao?.[0]?.relatorio_pdf_url

    let text = `Olá ${data.nome_cliente.split(' ')[0]}, segue o seu relatório de avaliação física!`
    if (pdfUrl) {
      text += `\n\nAcesse seu PDF aqui: ${pdfUrl}`
    } else {
      text += ` (Por favor, anexe o PDF gerado na conversa)`
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleGeneratePDF = () => {
    toast({ title: 'PDF', description: 'Gerando relatório PDF da avaliação...' })
    setTimeout(() => {
      toast({ title: 'Sucesso', description: 'Relatório PDF gerado com sucesso (Simulação).' })
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
              Detalhes da Avaliação
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.nome_cliente} -{' '}
              {format(new Date(data.data_avaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          {canSendWhatsApp && (
            <Button onClick={() => navigate(`/evaluation/${id}/reevaluate`)} variant="secondary">
              Nova Reavaliação
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">ID EVO</p>
              <p className="font-medium text-foreground">{data.evo_id || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium text-foreground">
                {data.telefone_cliente || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className="inline-flex mt-1 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                {data.status === 'pendente'
                  ? 'Pendente'
                  : data.status === 'em_progresso'
                    ? 'Em Progresso'
                    : 'Concluído'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objetivos</p>
              <p className="font-medium text-foreground">
                {data.objectives?.join(', ') || 'Nenhum selecionado'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Links do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.links_avaliacao && data.links_avaliacao.length > 0 ? (
              <>
                {data.links_avaliacao[0].mapeamento_sintomas_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Mapeamento de Sintomas
                    </p>
                    <a
                      href={data.links_avaliacao[0].mapeamento_sintomas_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {data.links_avaliacao[0].mapeamento_sintomas_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao[0].mapeamento_dor_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Mapeamento da Dor
                    </p>
                    <a
                      href={data.links_avaliacao[0].mapeamento_dor_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {data.links_avaliacao[0].mapeamento_dor_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao[0].bia_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">BIA</p>
                    <a
                      href={data.links_avaliacao[0].bia_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {data.links_avaliacao[0].bia_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao[0].my_score_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">My Score</p>
                    <a
                      href={data.links_avaliacao[0].my_score_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {data.links_avaliacao[0].my_score_url}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum link cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Respostas da Anamnese</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.respostas || {}).map(([key, value]) => {
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
                  className="p-4 bg-muted/30 border border-border/50 rounded-lg shadow-sm"
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
