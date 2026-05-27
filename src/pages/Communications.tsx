import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChatInterface } from '@/components/chat/ChatInterface'
import LegacyCommunications from '@/components/communications/LegacyCommunications'

export default function Communications() {
  const [isLegacyMode, setIsLegacyMode] = useState(
    () => localStorage.getItem('communications_mode') === 'legacy',
  )

  const toggleMode = (checked: boolean) => {
    setIsLegacyMode(checked)
    localStorage.setItem('communications_mode', checked ? 'legacy' : 'modern')
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6 flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Comunicação Interna</h1>
          <p className="text-zinc-400 mt-1">
            Converse com a equipe em tempo real ou use o sistema clássico.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
          <Label htmlFor="legacy-mode" className="text-zinc-300 font-medium cursor-pointer">
            Modo Clássico
          </Label>
          <Switch
            id="legacy-mode"
            checked={isLegacyMode}
            onCheckedChange={toggleMode}
            className="data-[state=checked]:bg-[#84cc16]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-[500px]">
        {isLegacyMode ? (
          <div className="h-full overflow-y-auto pr-2">
            <LegacyCommunications />
          </div>
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  )
}
