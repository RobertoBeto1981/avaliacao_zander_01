import { PlaySquare, Settings, History, ListTodo, MessageSquare } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoConfigTab } from '@/components/videos/VideoConfigTab'
import { HistoryTab } from '@/components/videos/HistoryTab'
import { TodayQueueTab } from '@/components/videos/TodayQueueTab'
import { MessageTemplatesTab } from '@/components/videos/MessageTemplatesTab'

export default function VideoScheduling() {
  return (
    <div className="container mx-auto py-8 max-w-6xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <PlaySquare className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automação de Vídeos</h1>
          <p className="text-muted-foreground text-lg">
            Centro de comando para configuração de envio automático de vídeos educativos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full max-w-3xl grid grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Fila do Dia
          </TabsTrigger>
          <TabsTrigger value="configs" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Gatilhos
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <TodayQueueTab />
        </TabsContent>

        <TabsContent
          value="configs"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <VideoConfigTab />
        </TabsContent>

        <TabsContent
          value="templates"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <MessageTemplatesTab />
        </TabsContent>

        <TabsContent
          value="history"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
