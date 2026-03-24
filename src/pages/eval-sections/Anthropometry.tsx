import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput } from '@/components/shared/FormControls'

export function AnthropometryFields({ disabled = false }: { disabled?: boolean }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Antropometria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FInput
            name="anthropometry.weight"
            label="Peso (kg)"
            type="number"
            step="0.1"
            placeholder="Ex: 75.5"
            disabled={disabled}
          />
          <FInput
            name="anthropometry.height"
            label="Altura (m)"
            type="number"
            step="0.01"
            placeholder="Ex: 1.75"
            disabled={disabled}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Circunferências (cm)
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
            <FInput
              name="anthropometry.shoulders"
              label="Ombros"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.chest"
              label="Tórax"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.waist"
              label="Cintura"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.abdomen"
              label="Abdômen"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.hips"
              label="Quadril"
              type="number"
              step="0.1"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pt-4 border-t border-border/50">
            <div className="col-span-full mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Membros Superiores (cm)
            </div>
            <FInput
              name="anthropometry.right_arm_relaxed"
              label="Braço Dir. (Relaxado)"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.right_arm_flexed"
              label="Braço Dir. (Contraído)"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.right_forearm"
              label="Antebraço Dir."
              type="number"
              step="0.1"
              disabled={disabled}
            />

            <FInput
              name="anthropometry.left_arm_relaxed"
              label="Braço Esq. (Relaxado)"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.left_arm_flexed"
              label="Braço Esq. (Contraído)"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.left_forearm"
              label="Antebraço Esq."
              type="number"
              step="0.1"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div className="col-span-full mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Membros Inferiores (cm)
            </div>
            <FInput
              name="anthropometry.right_thigh"
              label="Coxa Direita"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.right_calf"
              label="Panturrilha Direita"
              type="number"
              step="0.1"
              disabled={disabled}
            />

            <FInput
              name="anthropometry.left_thigh"
              label="Coxa Esquerda"
              type="number"
              step="0.1"
              disabled={disabled}
            />
            <FInput
              name="anthropometry.left_calf"
              label="Panturrilha Esquerda"
              type="number"
              step="0.1"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
