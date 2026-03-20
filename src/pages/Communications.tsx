import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { sendBulkMessage } from '@/services/notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Send, Users, Megaphone } from 'lucide-react'

export default function Communications() {
  const { toast } = useToast()
  const [targetRole, setTargetRole] = useState('todos')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await sendBulkMessage(targetRole, title, message)
      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso para os destinatários.',
      })
      setTitle('')
      setMessage('')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao enviar', description: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <Megaphone className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Comunicados</h1>
          <p className="text-muted-foreground text-lg">
            Envie mensagens e avisos internos para a equipe
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Nova Mensagem
          </CardTitle>
          <CardDescription>
            A notificação aparecerá imediatamente no sistema dos colaboradores selecionados, sem
            necessidade de e-mails.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-base">
                Destinatários
              </Label>
              <Select value={targetRole} onValueChange={setTargetRole} required>
                <SelectTrigger id="targetRole" className="h-12 text-base">
                  <SelectValue placeholder="Selecione o público alvo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos (Toda a Equipe)</SelectItem>
                  <SelectItem value="professor">Apenas Professores</SelectItem>
                  <SelectItem value="avaliador">Apenas Avaliadores</SelectItem>
                  <SelectItem value="fisioterapeuta">Apenas Fisioterapeutas</SelectItem>
                  <SelectItem value="nutricionista">Apenas Nutricionistas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Título do Comunicado
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião Geral nesta Sexta-feira"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-base">
                Mensagem
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva os detalhes do comunicado aqui..."
                className="min-h-[180px] text-base resize-none"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={sending}>
              {sending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" /> Enviar Comunicado
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
