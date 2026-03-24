import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardTable } from './DashboardTable'
import { Label } from '@/components/ui/label'
import { User, Eye } from 'lucide-react'

export function RoleViewTab({ users, evaluations }: { users: any[]; evaluations: any[] }) {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')

  const roleUsers = useMemo(
    () => users.filter((u) => u.role === selectedRole),
    [users, selectedRole],
  )

  const filteredEvals = useMemo(() => {
    if (!selectedUser) return []
    return evaluations.filter(
      (ev) => ev.professor_id === selectedUser || ev.avaliador_id === selectedUser,
    )
  }, [evaluations, selectedUser])

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-muted/10 border-border/50 shadow-sm">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Visão por Cargo
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v)
                setSelectedUser('')
              }}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Selecione o tipo de profissional..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="avaliador">Avaliador</SelectItem>
                <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                <SelectItem value="nutricionista">Nutricionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Selecione o Colaborador
            </Label>
            <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!selectedRole}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Escolha um profissional da equipe..." />
              </SelectTrigger>
              <SelectContent>
                {roleUsers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum profissional encontrado
                  </SelectItem>
                ) : (
                  roleUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="animate-fade-in-up mt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-1.5 rounded-md">
              <Eye className="w-5 h-5" />
            </span>
            O que o profissional visualiza agora:
          </h3>
          <DashboardTable data={filteredEvals} hideActions />
        </div>
      )}
    </div>
  )
}
