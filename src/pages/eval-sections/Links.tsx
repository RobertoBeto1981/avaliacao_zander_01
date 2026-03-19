import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FTextarea } from '@/components/shared/FormControls'

export function LinksFields() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">
          Links do Cliente e Observações Finais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FInput name="client_links.anamnese" label="Link: Anamnese" placeholder="https://" />
          <FInput
            name="client_links.symptoms"
            label="Link: Mapeamento de Sintomas"
            placeholder="https://"
          />
          <FInput name="client_links.pain" label="Link: Mapeamento da Dor" placeholder="https://" />
          <FInput name="client_links.bia" label="Link: BIA" placeholder="https://" />
          <FInput name="client_links.myscore" label="Link: My Score" placeholder="https://" />
        </div>

        <div className="pt-4 border-t border-border">
          <FTextarea
            name="final_observations"
            label="Observações Finais do Avaliador"
            placeholder="Anotações gerais..."
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
