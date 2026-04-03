import { useState, useEffect } from 'react'
import { getVideoConfigs } from '@/services/videos'
import { ConfigCard } from './ConfigCard'

const STANDARD_TRIGGERS = [1, 7, 30, 60, 90]

export function VideoConfigTab() {
  const [configs, setConfigs] = useState<any[]>([])
  const [triggers, setTriggers] = useState<number[]>([])
  const [newTrigger, setNewTrigger] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVideoConfigs()
      .then((data) => {
        setConfigs(data)
        const dbTriggers = data.map((c) => c.dias_trigger)
        const allTriggers = Array.from(new Set([...STANDARD_TRIGGERS, ...dbTriggers])).sort(
          (a, b) => a - b,
        )
        setTriggers(allTriggers)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAddTrigger = () => {
    const val = parseInt(newTrigger)
    if (!isNaN(val) && val > 0 && !triggers.includes(val)) {
      setTriggers((prev) => [...prev, val].sort((a, b) => a - b))
      setNewTrigger('')
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up zander-gatilhos">
      <style>{`
        .zander-gatilhos button.bg-primary,
        .zander-gatilhos button.bg-primary:hover,
        .zander-gatilhos button:not([variant="outline"]):not([variant="ghost"]):not([variant="secondary"]):not(:disabled) {
          background-color: #95c23d !important;
          color: black !important;
        }
        .zander-gatilhos button:not([variant="outline"]):not([variant="ghost"]):not([variant="secondary"]):not(:disabled):hover {
          background-color: #85b035 !important;
        }
        .zander-gatilhos button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          background-color: hsl(var(--muted)) !important;
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
      <div className="space-y-6 col-span-1 xl:col-span-2 text-muted-foreground mb-2">
        <p>
          Configure os vídeos e mensagens que serão disparados automaticamente para seus alunos após
          a avaliação. Faça o upload do vídeo ou insira um link externo. O sistema verificará
          diariamente e enviará pelo WhatsApp.
        </p>
        <div className="flex items-center gap-4 mt-4 bg-muted/20 p-4 rounded-lg border border-border/50">
          <span className="text-sm font-semibold text-foreground">Adicionar Novo Gatilho:</span>
          <input
            type="number"
            min="1"
            placeholder="Ex: 45 (dias)"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            className="w-36 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleAddTrigger}
            disabled={!newTrigger}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#95c23d] text-black hover:bg-[#85b035] h-10 px-4 py-2"
          >
            Adicionar Gatilho
          </button>
        </div>
      </div>

      {triggers.map((days) => {
        const config = configs.find((c) => c.dias_trigger === days)
        return <ConfigCard key={days} triggerDays={days} initialConfig={config} />
      })}
    </div>
  )
}
