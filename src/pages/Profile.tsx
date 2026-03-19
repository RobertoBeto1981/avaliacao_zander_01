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
import { useToast } from '@/hooks/use-toast'
import { Camera, Save } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
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
        role: profile.role,
        periodo: profile.periodo,
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

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
                <AvatarFallback className="text-3xl">
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
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo / Papel</Label>
                <Select
                  value={profile?.role || ''}
                  onValueChange={(v) => setProfile({ ...profile, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="avaliador">Avaliador</SelectItem>
                    <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                    <SelectItem value="nutricionista">Nutricionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {profile?.role === 'professor' && (
              <div className="space-y-2 animate-fade-in-up">
                <Label>Período de Trabalho</Label>
                <Select
                  value={profile?.periodo || ''}
                  onValueChange={(v) => setProfile({ ...profile, periodo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
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
        </CardContent>
      </Card>
    </div>
  )
}
