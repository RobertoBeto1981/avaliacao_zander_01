import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FTextarea, FSwitch } from '@/components/shared/FormControls'
import { FMultiSelect } from '@/components/shared/FormAdvanced'
import { YES_NO, INTOLERANCES, HEALTH_INSURANCES } from '@/constants/options'

export function HealthFields() {
  const { control, setValue, getValues } = useFormContext()

  const medChoice = useWatch({ control, name: 'medications.choice' })
  const allergyChoice = useWatch({ control, name: 'allergies.choice' })
  const intolChoices = useWatch({ control, name: 'intolerances.choices' }) || []
  const cardioChoice = useWatch({ control, name: 'cardio_pathology.choice' })
  const surgChoice = useWatch({ control, name: 'surgeries.choice' })
  const painChoice = useWatch({ control, name: 'pains.choice' })
  const insuranceChoice = useWatch({ control, name: 'health_insurance.choice' })

  useEffect(() => {
    if (painChoice) {
      if (!getValues('pains.observation'))
        setValue('pains.observation', 'Observar Mapeamento de Dor')
    }
  }, [painChoice, setValue, getValues])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Histórico Médico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FSwitch name="medications.choice" label="Remédio Contínuo?" />
            {medChoice && (
              <div className="animate-slide-up">
                <FTextarea name="medications.list" label="Quais?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="allergies.choice" label="Possui Alergia?" />
            {allergyChoice && (
              <div className="animate-slide-up">
                <FTextarea name="allergies.list" label="Qual?" />
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

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <FSelect
            name="health_exams.choice"
            label="Exames (Colesterol/Glicose) Alterados?"
            options={YES_NO}
          />
          <FTextarea name="health_exams.notes" label="Observações sobre Exames" />
          <FSwitch name="diabetes" label="Diabetes" />
          <FSwitch name="hypertension" label="Hipertenso" />
          <FSwitch name="respiratory_pathology" label="Patologia Respiratória" />
          <div className="space-y-4">
            <FSwitch name="cardio_pathology.choice" label="Patologia Cardiovascular?" />
            {cardioChoice && (
              <div className="animate-slide-up">
                <FTextarea name="cardio_pathology.list" label="Qual?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="surgeries.choice" label="Cirurgia?" />
            {surgChoice && (
              <div className="animate-slide-up">
                <FTextarea name="surgeries.list" label="Qual?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="pains.choice" label="Dor Muscular/Articular?" />
            {painChoice && (
              <div className="animate-slide-up">
                <FTextarea name="pains.observation" label="Observações da Dor" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-4">
            <FSelect
              name="health_insurance.choice"
              label="Plano de Saúde"
              options={HEALTH_INSURANCES}
            />
            {insuranceChoice === 'OUTRO' && (
              <div className="animate-slide-up">
                <FInput name="health_insurance.other" label="Qual Plano?" />
              </div>
            )}
          </div>
          <FInput name="emergency_contact" label="Contato de Emergência" />
        </div>
      </CardContent>
    </Card>
  )
}
