import { useFormContext, useWatch } from 'react-hook-form'
import { addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FTextarea, FSwitch } from '@/components/shared/FormControls'
import { FDatePicker } from '@/components/shared/FormAdvanced'
import {
  OBJECTIVES,
  FREQUENCIES,
  ACTIVITY_LEVELS,
  PRACTICE_TIMES,
  YES_NO_HAD,
  MEALS_PER_DAY,
  SLEEP_HOURS,
  ALCOHOL_FREQ,
} from '@/constants/options'

export function LifestyleFields() {
  const { control } = useFormContext()
  const today = new Date()
  const minTarget = addDays(today, 60)
  const maxTarget = addDays(today, 90)

  const nutChoice = useWatch({ control, name: 'nutritional_status.choice' })
  const supChoice = useWatch({ control, name: 'supplements.choice' })
  const smokeChoice = useWatch({ control, name: 'smoking.choice' })

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Estilo de Vida e Histórico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FSelect name="main_objective" label="Principal Objetivo" options={OBJECTIVES} />
          <FDatePicker
            name="target_date"
            label="Data Alvo (60 a 90 dias)"
            disabled={(d: Date) => d < minTarget || d > maxTarget}
          />
          <FSelect name="training_frequency" label="Frequência Atual" options={FREQUENCIES} />
          <FSelect name="activity_level" label="Nível de Atividade" options={ACTIVITY_LEVELS} />
          <FSelect name="practice_time" label="Tempo de Prática" options={PRACTICE_TIMES} />
          <FSelect name="meals_per_day" label="Refeições/Dia" options={MEALS_PER_DAY} />
          <FSelect name="sleep_hours" label="Sono/Noite" options={SLEEP_HOURS} />
          <FSelect name="alcohol" label="Consumo de Álcool" options={ALCOHOL_FREQ} />
        </div>
        <FTextarea name="modalities" label="Modalidades" />

        <div className="pt-4 border-t border-border grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FSelect
              name="nutritional_status.choice"
              label="Acompanhamento Nutricional"
              options={YES_NO_HAD}
            />
            {nutChoice === 'Já tive' && (
              <div className="animate-slide-up">
                <FTextarea name="nutritional_status.reason" label="Porque não tem mais?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="supplements.choice" label="Usa Suplementos?" />
            {supChoice && (
              <div className="animate-slide-up">
                <FTextarea name="supplements.list" label="Quais?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="smoking.choice" label="Fuma?" />
            {smokeChoice && (
              <div className="animate-slide-up">
                <FInput name="smoking.amount" label="Quantos cigarros por dia?" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
