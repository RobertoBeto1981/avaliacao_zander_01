import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatPhone } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState<string[]>(['professor'])
  const [periodos, setPeriodos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (roles.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione ao menos um cargo/função.',
        variant: 'destructive',
      })
      return
    }

    if (roles.includes('professor') && periodos.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione ao menos um período de trabalho como professor.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await signUp(email, password, {
        nome,
        telefone,
        roles,
        role: roles[0],
        periodos,
      })
      if (error) throw error
      toast({
        title: 'Sucesso',
        description: 'Verifique seu e-mail para confirmar o cadastro.',
      })
      navigate('/login')
    } catch (err: any) {
      toast({
        title: 'Erro no cadastro',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12 animate-fade-in">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para acessar o sistema Zander</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                required
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="+55 (00) 00000-0000"
                maxLength={19}
              />
            </div>

            <div className="space-y-3">
              <Label>Cargos / Funções</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 bg-muted/30 p-3 rounded-md border border-border/50">
                {[
                  { id: 'professor', label: 'Professor' },
                  { id: 'avaliador', label: 'Avaliador' },
                  { id: 'fisioterapeuta', label: 'Fisioterapeuta' },
                  { id: 'nutricionista', label: 'Nutricionista' },
                ].map((r) => (
                  <div key={r.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={r.id}
                      checked={roles.includes(r.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoles([...roles, r.id])
                        } else {
                          setRoles(roles.filter((role) => role !== r.id))
                        }
                      }}
                    />
                    <Label
                      htmlFor={r.id}
                      className="cursor-pointer font-normal text-sm leading-none"
                    >
                      {r.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {roles.includes('professor') && (
              <div className="space-y-3 animate-fade-in">
                <Label>Períodos de Trabalho (Professor)</Label>
                <div className="grid grid-cols-3 gap-3 mt-2 bg-muted/30 p-3 rounded-md border border-border/50">
                  {['Manhã', 'Tarde', 'Noite'].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <Checkbox
                        id={`per-${p}`}
                        checked={periodos.includes(p)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPeriodos([...periodos, p])
                          } else {
                            setPeriodos(periodos.filter((x) => x !== p))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`per-${p}`}
                        className="cursor-pointer font-normal text-sm leading-none"
                      >
                        {p}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label>Senha</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Cadastrar
            </Button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
