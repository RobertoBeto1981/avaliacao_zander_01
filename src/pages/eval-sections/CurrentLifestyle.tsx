import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FTextarea, FSwitch } from '@/components/shared/FormControls'
import { FMultiSelect } from '@/components/shared/FormAdvanced'
import {
  YES_NO_HAD,
  MEALS_PER_DAY,
  SLEEP_HOURS,
  ALCOHOL_FREQ,
  INTOLERANCES,
} from '@/constants/options'

export function CurrentLifestyleFields() {
  const { control } = useFormContext()

  const nutChoice = useWatch({ control, name: 'nutritional_status.choice' })
  const supChoice = useWatch({ control, name: 'supplements.choice' })
  const smokeChoice = useWatch({ control, name: 'smoking.choice' })
  const intolChoices = useWatch({ control, name: 'intolerances.choices' }) || []

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Estilo de Vida Atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FSelect name="meals_per_day" label="Refeições" options={MEALS_PER_DAY} />
          <FSelect name="sleep_hours" label="Sono" options={SLEEP_HOURS} />
          <FSelect name="alcohol" label="Consumo de Bebidas Alcoólicas" options={ALCOHOL_FREQ} />
        </div>

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
            <FSwitch name="supplements.choice" label="Usa Suplementos Alimentares?" />
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

        <div className="pt-4 border-t border-border">
          <FMultiSelect name="intolerances.choices" label="Intolerâncias" options={INTOLERANCES} />
          {intolChoices.includes('OUTRO') && (
            <div className="mt-4 animate-slide-up">
              <FTextarea name="intolerances.list" label="Quais outras?" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
