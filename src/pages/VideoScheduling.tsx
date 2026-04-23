import { PlaySquare, History, ListTodo, CalendarClock, Zap, Library } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoConfigTab } from '@/components/videos/VideoConfigTab'
import { HistoryTab } from '@/components/videos/HistoryTab'
import { TodayQueueTab } from '@/components/videos/TodayQueueTab'
import { MessageTemplatesTab } from '@/components/videos/MessageTemplatesTab'
import { ProgramadosTab } from '@/components/videos/ProgramadosTab'
import { ManualClientMessagingTab } from '@/components/videos/ManualClientMessagingTab'
import { MessageLibrary } from '@/components/MessageLibrary'
import { useState } from 'react'

export default function VideoScheduling() {
  const [activeTab, setActiveTab] = useState('queue')
  const [manualMessage, setManualMessage] = useState('')

  return (
    <div className="container mx-auto py-8 max-w-6xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <PlaySquare className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automação de Vídeos & Mensagens</h1>
          <p className="text-muted-foreground text-lg">
            Centro de comando unificado para disparo de vídeos e comunicação direta com alunos.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full max-w-5xl flex flex-wrap h-auto justify-start gap-1">
          <TabsTrigger value="queue" className="flex items-center gap-2 flex-1 min-w-[120px]">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Fila do Dia</span>
            <span className="sm:hidden">Fila</span>
          </TabsTrigger>
          <TabsTrigger value="programados" className="flex items-center gap-2 flex-1 min-w-[120px]">
            <CalendarClock className="w-4 h-4" />
            Programados
          </TabsTrigger>
          <TabsTrigger value="central" className="flex items-center gap-2 flex-1 min-w-[160px]">
            <Zap className="w-4 h-4" />
            Central de Automação
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="flex items-center gap-2 flex-1 min-w-[160px]">
            <Library className="w-4 h-4" />
            Biblioteca de Mensagens
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 flex-1 min-w-[120px]">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <TodayQueueTab />
        </TabsContent>

        <TabsContent
          value="programados"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <ProgramadosTab />
        </TabsContent>

        <TabsContent
          value="central"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="space-y-12">
            <ManualClientMessagingTab
              initialMessage={manualMessage}
              onMessageChange={setManualMessage}
            />

            <div className="space-y-4">
              <div className="border-b border-border/50 pb-2">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Gatilhos de Vídeo (Automáticos)
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure os dias e os vídeos que serão adicionados automaticamente na Fila do Dia
                  conforme o tempo da avaliação.
                </p>
              </div>
              <VideoConfigTab />
            </div>

            <div className="space-y-4">
              <div className="border-b border-border/50 pb-2">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Templates de Sistema
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure as mensagens disparadas por ações fixas do sistema (ex: Envio de Links).
                </p>
              </div>
              <MessageTemplatesTab />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="biblioteca"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="max-w-4xl">
            <MessageLibrary
              type="external"
              onReuse={(title, msg) => {
                setManualMessage(msg)
                setActiveTab('central')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
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
