import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FSelect, FTextarea } from '@/components/shared/FormControls'
import { FMultiSelect } from '@/components/shared/FormAdvanced'
import { DAYS_OF_WEEK, SESSION_DURATIONS, BODY_PARTS, DISCOVERY_SOURCES } from '@/constants/options'

export function TrainingFields() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Preferências de Treino</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FMultiSelect
              name="available_days"
              label="Dias Disponíveis para Treino"
              options={DAYS_OF_WEEK}
            />
          </div>
          <FSelect
            name="session_duration"
            label="Tempo Disponível por Sessão"
            options={SESSION_DURATIONS}
          />
          <FSelect
            name="discovery_source"
            label="Como soube da academia?"
            options={DISCOVERY_SOURCES}
          />
        </div>

        <div className="space-y-6 pt-4 border-t border-border">
          <FMultiSelect
            name="enjoys_training"
            label="Gosta de Treinar (Partes do Corpo)"
            options={BODY_PARTS}
          />
          <FMultiSelect
            name="dislikes_looking_at"
            label="Gostaria de Melhorar (Incomoda ao olhar no espelho)"
            options={BODY_PARTS}
          />
          <FMultiSelect
            name="dislikes_training"
            label="NÃO GOSTA de Treinar (Partes do Corpo)"
            options={BODY_PARTS}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <FTextarea name="favorite_exercises" label="Exercícios Favoritos" />
          <FTextarea name="hated_exercises" label="Exercícios que não gosta de fazer" />
        </div>
      </CardContent>
    </Card>
  )
}
