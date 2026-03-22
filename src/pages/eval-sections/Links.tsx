import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FTextarea } from '@/components/shared/FormControls'
import { Info } from 'lucide-react'

export function LinksFields({
  isProfessor = false,
  isAvaliador = false,
}: {
  isProfessor?: boolean
  isAvaliador?: boolean
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Links do Cliente e Observações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <fieldset disabled={isProfessor} className="grid md:grid-cols-2 gap-6">
          <FInput
            name="client_links.symptoms"
            label="Link: Mapeamento de Sintomas"
            placeholder="https://"
          />
          <FInput name="client_links.pain" label="Link: Mapeamento da Dor" placeholder="https://" />
          <FInput name="client_links.bia" label="Link: BIA" placeholder="https://" />
          <FInput name="client_links.myscore" label="Link: My Score" placeholder="https://" />
        </fieldset>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-1 relative">
            <FTextarea
              name="final_observations"
              label="Observações Finais do Avaliador"
              placeholder="Anotações gerais..."
              className="min-h-[120px]"
              disabled={isProfessor}
            />
            {isProfessor && (
              <div className="absolute top-0 right-0 -mt-1 text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-bl-md border-b border-l border-border/50 shadow-sm">
                <Info className="w-3 h-3" /> Somente Leitura
              </div>
            )}
          </div>
          <div className="space-y-1 relative">
            <FTextarea
              name="professor_observations"
              label="Observações do Professor"
              placeholder="Anotações do professor..."
              className="min-h-[120px]"
              disabled={isAvaliador}
            />
            {isAvaliador && (
              <div className="absolute top-0 right-0 -mt-1 text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-bl-md border-b border-l border-border/50 shadow-sm">
                <Info className="w-3 h-3" /> Exclusivo do Professor
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
