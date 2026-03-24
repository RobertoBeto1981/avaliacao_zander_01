import { useState, useEffect, useRef, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FSwitch, FInput } from '@/components/shared/FormControls'
import { Button } from '@/components/ui/button'
import { Play, Square, Activity, AlertCircle, RefreshCw } from 'lucide-react'
import { differenceInYears } from 'date-fns'
import { cn } from '@/lib/utils'

function classifyVO2(vo2: number, age: number, gender: string): string {
  const isMale = gender === 'Masculino'
  if (isMale) {
    if (age <= 29) {
      if (vo2 < 34.6) return 'Fraco'
      if (vo2 <= 38.3) return 'Regular'
      if (vo2 <= 45.1) return 'Bom'
      if (vo2 <= 50.9) return 'Excelente'
      return 'Superior'
    } else if (age <= 39) {
      if (vo2 < 32.5) return 'Fraco'
      if (vo2 <= 35.8) return 'Regular'
      if (vo2 <= 42.4) return 'Bom'
      if (vo2 <= 48.9) return 'Excelente'
      return 'Superior'
    } else if (age <= 49) {
      if (vo2 < 30.9) return 'Fraco'
      if (vo2 <= 33.5) return 'Regular'
      if (vo2 <= 38.9) return 'Bom'
      if (vo2 <= 45.1) return 'Excelente'
      return 'Superior'
    } else if (age <= 59) {
      if (vo2 < 28.0) return 'Fraco'
      if (vo2 <= 30.9) return 'Regular'
      if (vo2 <= 35.7) return 'Bom'
      if (vo2 <= 40.9) return 'Excelente'
      return 'Superior'
    } else {
      if (vo2 < 23.1) return 'Fraco'
      if (vo2 <= 26.0) return 'Regular'
      if (vo2 <= 32.2) return 'Bom'
      if (vo2 <= 36.4) return 'Excelente'
      return 'Superior'
    }
  } else {
    // Female
    if (age <= 29) {
      if (vo2 < 28.9) return 'Fraco'
      if (vo2 <= 32.2) return 'Regular'
      if (vo2 <= 36.9) return 'Bom'
      if (vo2 <= 41.0) return 'Excelente'
      return 'Superior'
    } else if (age <= 39) {
      if (vo2 < 27.6) return 'Fraco'
      if (vo2 <= 30.5) return 'Regular'
      if (vo2 <= 34.6) return 'Bom'
      if (vo2 <= 38.6) return 'Excelente'
      return 'Superior'
    } else if (age <= 49) {
      if (vo2 < 25.8) return 'Fraco'
      if (vo2 <= 28.7) return 'Regular'
      if (vo2 <= 32.4) return 'Bom'
      if (vo2 <= 36.3) return 'Excelente'
      return 'Superior'
    } else if (age <= 59) {
      if (vo2 < 24.5) return 'Fraco'
      if (vo2 <= 27.3) return 'Regular'
      if (vo2 <= 30.2) return 'Bom'
      if (vo2 <= 32.3) return 'Excelente'
      return 'Superior'
    } else {
      if (vo2 < 22.8) return 'Fraco'
      if (vo2 <= 25.2) return 'Regular'
      if (vo2 <= 27.5) return 'Bom'
      if (vo2 <= 29.8) return 'Excelente'
      return 'Superior'
    }
  }
}

export function VO2TestFields({ disabled = false }: { disabled?: boolean }) {
  const { control, setValue } = useFormContext()
  const enabled = useWatch({ control, name: 'vo2_test.enabled' })
  const selectedBpm = useWatch({ control, name: 'vo2_test.bpm' }) || 88
  const beats15sStr = useWatch({ control, name: 'vo2_test.beats_15s' })
  const dataNascimento = useWatch({ control, name: 'data_nascimento' })
  const gender = useWatch({ control, name: 'gender' })

  const beats15s = beats15sStr ? Number(beats15sStr) : 0

  const age = useMemo(() => {
    if (!dataNascimento) return 0
    return differenceInYears(new Date(), new Date(dataNascimento))
  }, [dataNascimento])

  const [timeLeft, setTimeLeft] = useState(180)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const metronomeIntervalRef = useRef<any>(null)

  const playBeep = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime) // 800Hz beep
    gain.gain.setValueAtTime(0.1, ctx.currentTime) // Volume
    osc.start()
    osc.stop(ctx.currentTime + 0.05) // Short 50ms beep
  }

  // Timer Effect
  useEffect(() => {
    let timer: any
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false)
      setIsFinished(true)
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft])

  // Metronome Effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const intervalMs = 60000 / selectedBpm
      metronomeIntervalRef.current = setInterval(playBeep, intervalMs)
      playBeep() // Play first beat immediately
    } else {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current)
    }
  }, [isRunning, selectedBpm, timeLeft])

  // Calculation Effect
  useEffect(() => {
    if (beats15s > 0 && age > 0) {
      const vo2Max = (15 * 220 - age) / (6 * beats15s)
      setValue('vo2_test.vo2_max', vo2Max.toFixed(2))

      if (gender) {
        setValue('vo2_test.classification', classifyVO2(vo2Max, age, gender))
      } else {
        setValue('vo2_test.classification', 'Gênero não informado')
      }
    } else {
      setValue('vo2_test.vo2_max', undefined)
      setValue('vo2_test.classification', undefined)
    }
  }, [beats15s, age, gender, setValue])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(180)
      setIsFinished(false)
    }
    setIsRunning(true)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsFinished(false)
    setTimeLeft(180)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Avaliação Cardiorrespiratória
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FSwitch
          name="vo2_test.enabled"
          label="Realizar teste de VO2 Step"
          disabled={disabled || isRunning}
        />

        {enabled && (
          <div className="animate-slide-down space-y-6 pt-4 border-t border-border">
            {(!age || !gender) && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 p-3 rounded-md flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Para o cálculo correto do VO2 e classificação, certifique-se de preencher a{' '}
                  <strong>Data de Nascimento</strong> e o <strong>Gênero</strong> na Identificação
                  do Cliente.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <label className="text-sm font-medium">Cadência do Metrônomo (BPM)</label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={selectedBpm === 88 ? 'default' : 'outline'}
                    onClick={() => setValue('vo2_test.bpm', 88)}
                    disabled={isRunning || disabled}
                    className="flex-1"
                  >
                    88 BPM
                  </Button>
                  <Button
                    type="button"
                    variant={selectedBpm === 96 ? 'default' : 'outline'}
                    onClick={() => setValue('vo2_test.bpm', 96)}
                    disabled={isRunning || disabled}
                    className="flex-1"
                  >
                    96 BPM
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border">
                <div
                  className={cn(
                    'text-5xl font-mono font-bold tracking-wider transition-colors',
                    timeLeft <= 10 && timeLeft > 0 ? 'text-destructive' : 'text-foreground',
                    isFinished ? 'text-muted-foreground' : '',
                  )}
                >
                  {formatTime(timeLeft)}
                </div>
                <div className="flex gap-2 mt-4">
                  {!isRunning ? (
                    <Button
                      type="button"
                      onClick={handleStart}
                      disabled={disabled || (timeLeft === 0 && isFinished)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Iniciar Teste
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleStop}
                      variant="destructive"
                      className="min-w-[120px]"
                    >
                      <Square className="w-4 h-4 mr-2 fill-current" />
                      Parar
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="outline"
                    size="icon"
                    disabled={isRunning || disabled}
                    title="Reiniciar cronômetro"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isFinished && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 p-4 rounded-md text-center font-medium animate-fade-in text-lg">
                Teste finalizado. Meça o pulso do cliente por exatos 15 segundos agora.
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-border">
              <FInput
                name="vo2_test.beats_15s"
                label="Batidas em 15 segundos"
                type="number"
                min="0"
                max="300"
                placeholder="Ex: 35"
                disabled={disabled}
              />
              <FInput
                name="vo2_test.vo2_max"
                label="VO² Máximo (ml/kg/min)"
                readOnly
                className="bg-muted/50 font-semibold"
                placeholder="Calculado auto."
              />
              <FInput
                name="vo2_test.classification"
                label="Classificação"
                readOnly
                className={cn(
                  'bg-muted/50 font-bold',
                  useWatch({ control, name: 'vo2_test.classification' }) === 'Fraco' &&
                    'text-red-600 dark:text-red-400',
                  useWatch({ control, name: 'vo2_test.classification' }) === 'Regular' &&
                    'text-amber-600 dark:text-amber-400',
                  useWatch({ control, name: 'vo2_test.classification' }) === 'Bom' &&
                    'text-emerald-600 dark:text-emerald-400',
                  useWatch({ control, name: 'vo2_test.classification' }) === 'Excelente' &&
                    'text-blue-600 dark:text-blue-400',
                  useWatch({ control, name: 'vo2_test.classification' }) === 'Superior' &&
                    'text-indigo-600 dark:text-indigo-400',
                )}
                placeholder="Calculado auto."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
