import { useState, useEffect } from 'react'
import { getVideoConfigs } from '@/services/videos'
import { ConfigCard } from './ConfigCard'

const STANDARD_TRIGGERS = [1, 7, 30, 60, 90]

export function VideoConfigTab() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVideoConfigs()
      .then(setConfigs)
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up">
      <div className="space-y-6 col-span-1 xl:col-span-2 text-muted-foreground mb-2">
        <p>
          Configure os vídeos e mensagens que serão disparados automaticamente para seus alunos após
          a avaliação. Faça o upload do vídeo ou insira um link externo. O sistema verificará
          diariamente e enviará pelo WhatsApp.
        </p>
      </div>

      {STANDARD_TRIGGERS.map((days) => {
        const config = configs.find((c) => c.dias_trigger === days)
        return <ConfigCard key={days} triggerDays={days} initialConfig={config} />
      })}
    </div>
  )
}
