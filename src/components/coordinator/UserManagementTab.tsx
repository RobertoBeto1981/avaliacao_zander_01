import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, UserPlus, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updateUser, deleteUserCompletely } from '@/services/users'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function UserManagementTab({ users, onUpdate }: { users: any[]; onUpdate: () => void }) {
  const { toast } = useToast()
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isIncludeOpen, setIsIncludeOpen] = useState(false)

  const handleApprove = async (id: string, role: string) => {
    try {
      await updateUser(id, { role, pending_role: null })
      toast({ title: 'Sucesso', description: 'Cargo aprovado com sucesso.' })
      onUpdate()
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateUser(id, { pending_role: null })
      toast({ title: 'Sucesso', description: 'Solicitação recusada.' })
      onUpdate()
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Atenção: Tem certeza que deseja excluir este usuário permanentemente? Todo o acesso dele será revogado.',
      )
    )
      return
    try {
      await deleteUserCompletely(id)
      toast({ title: 'Excluído', description: 'Usuário excluído com sucesso.' })
      onUpdate()
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    }
  }

  const handleSaveEdit = async (e: any) => {
    e.preventDefault()
    try {
      await updateUser(editingUser.id, {
        nome: editingUser.nome,
        role: editingUser.role,
        telefone: editingUser.telefone,
        periodo: editingUser.periodo,
      })
      toast({ title: 'Atualizado', description: 'Dados do usuário atualizados.' })
      setEditingUser(null)
      onUpdate()
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    }
  }

  const pendingUsers = users.filter((u) => u.pending_role)
  const regularUsers = users.filter((u) => !u.pending_role)

  return (
    <div className="space-y-8 animate-fade-in">
      {pendingUsers.length > 0 && (
        <div className="border-l-4 border-l-amber-500 bg-amber-500/10 p-4 rounded-r-lg shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            Aprovações de Mudança de Cargo
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo Atual</TableHead>
                <TableHead>Cargo Solicitado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{u.role}</TableCell>
                  <TableCell className="capitalize font-bold text-primary">
                    {u.pending_role}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => handleReject(u.id)}
                    >
                      Recusar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => handleApprove(u.id, u.pending_role)}
                    >
                      Aprovar Mudança
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h3 className="text-xl font-bold">Gerenciar Colaboradores</h3>
          <Button onClick={() => setIsIncludeOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" /> Incluir Colaborador
          </Button>
        </div>

        <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regularUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                regularUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="capitalize">
                      <Badge variant="outline" className="font-medium">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.telefone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => setEditingUser(u)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(u.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(v) => !v && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editingUser.nome}
                  onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo / Permissão</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="avaliador">Avaliador</SelectItem>
                    <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                    <SelectItem value="nutricionista">Nutricionista</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.role === 'professor' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Período de Trabalho</Label>
                  <Select
                    value={editingUser.periodo || ''}
                    onValueChange={(v) => setEditingUser({ ...editingUser, periodo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editingUser.telefone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, telefone: e.target.value })}
                />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isIncludeOpen} onOpenChange={setIsIncludeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Novo Colaborador
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              O cadastro de novos colaboradores é feito pelo próprio profissional através da página
              de registro do sistema.
              <br />
              <br />
              Copie o link abaixo e envie para ele. A autorização do acesso básico é automática e
              ele poderá logar imediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 items-center mt-4 bg-muted/50 p-2 rounded-lg border">
            <Input
              readOnly
              value={`${window.location.origin}/register`}
              className="bg-background border-none focus-visible:ring-0"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/register`)
                toast({
                  title: 'Copiado',
                  description: 'Link copiado para a área de transferência.',
                })
              }}
            >
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
