import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getProfile, updateProfile, uploadAvatar } from '@/services/profile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Camera, Save, KeyRound } from 'lucide-react'
import { formatPhone } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [password, setPassword] = useState('')
  const [solicitado, setSolicitado] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      getProfile(user.id)
        .then((data) => {
          setProfile(data)
          setLoading(false)
        })
        .catch((err) => {
          toast({ variant: 'destructive', title: 'Erro ao carregar', description: err.message })
          setLoading(false)
        })
    }
  }, [user, toast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(user!.id, {
        nome: profile.nome,
        telefone: profile.telefone,
        periodos: profile.periodos,
        pending_roles: profile.pending_roles,
      })
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setUploading(true)
    try {
      const file = e.target.files[0]
      const url = await uploadAvatar(user!.id, file)
      await updateProfile(user!.id, { foto_url: url })
      setProfile({ ...profile, foto_url: url })
      toast({ title: 'Sucesso', description: 'Foto de perfil atualizada.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' })
      return
    }
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      })
      return
    }
    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Senha atualizada com sucesso.' })
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao alterar senha', description: err.message })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const isProfessor = profile?.roles?.includes('professor') || profile?.role === 'professor'

  return (
    <div className="container mx-auto py-8 max-w-2xl animate-fade-in">
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Meu Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais e profissionais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile?.foto_url} className="object-cover" />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                  {profile?.nome?.substring(0, 2)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="default"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-5 w-5" />
              </Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            {uploading && (
              <span className="text-sm font-medium text-primary animate-pulse">
                Enviando foto...
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={profile?.nome || ''}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-[10px] text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={profile?.telefone || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, telefone: formatPhone(e.target.value) })
                  }
                  placeholder="+55 (00) 00000-0000"
                  maxLength={19}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargos / Papéis Atuais</Label>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] py-1.5 items-center px-3 bg-muted rounded-md">
                  {(profile?.roles || (profile?.role ? [profile.role] : [])).map((r: string) => (
                    <span
                      key={r}
                      className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Solicitar Adição de Cargos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2 bg-muted/30 p-3 rounded-md border border-border/50">
                {['professor', 'avaliador', 'fisioterapeuta', 'nutricionista'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pending-role-${role}`}
                      checked={profile?.pending_roles?.includes(role)}
                      onCheckedChange={(checked) => {
                        const current = profile?.pending_roles || []
                        if (checked) {
                          setProfile({ ...profile, pending_roles: [...current, role] })
                        } else {
                          setProfile({
                            ...profile,
                            pending_roles: current.filter((x: string) => x !== role),
                          })
                        }
                      }}
                    />
                    <Label
                      htmlFor={`pending-role-${role}`}
                      className="cursor-pointer font-normal text-sm capitalize leading-none"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
              {profile?.pending_roles?.length > 0 && (
                <p className="text-[11px] text-primary/80 font-medium mt-1">
                  Sua solicitação para os cargos ({profile.pending_roles.join(', ')}) está pendente
                  de aprovação pela coordenação.
                </p>
              )}
            </div>

            {isProfessor && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-3">
                  <Label>Períodos de Trabalho (Professor)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 bg-muted/30 p-3 rounded-md border border-border/50">
                    {['Manhã', 'Tarde', 'Noite'].map((p) => (
                      <div key={p} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perfil-per-${p}`}
                          checked={profile?.periodos?.includes(p)}
                          onCheckedChange={(checked) => {
                            const current = profile?.periodos || []
                            if (checked) {
                              setProfile({ ...profile, periodos: [...current, p] })
                            } else {
                              setProfile({
                                ...profile,
                                periodos: current.filter((x: string) => x !== p),
                              })
                            }
                          }}
                        />
                        <Label
                          htmlFor={`perfil-per-${p}`}
                          className="cursor-pointer font-normal text-sm leading-none"
                        >
                          {p}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Label>Recebimento de Novos Alunos</Label>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Sinalize para a coordenação que você está disponível para receber um novo aluno
                    para montagem de treino.
                  </p>
                  <Button
                    type="button"
                    variant={solicitado ? 'secondary' : 'default'}
                    onClick={() => {
                      setSolicitado(true)
                      toast({ title: 'Sucesso', description: 'Solicitação enviada à coordenação.' })
                    }}
                    disabled={solicitado}
                  >
                    {solicitado ? 'Aluno solicitado' : 'Solicitar aluno'}
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full font-bold" disabled={saving}>
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4 pt-8 border-t border-border mt-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Alterar Senha
            </h3>
            <form
              onSubmit={handlePasswordChange}
              className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" disabled={changingPassword || !password}>
                {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
