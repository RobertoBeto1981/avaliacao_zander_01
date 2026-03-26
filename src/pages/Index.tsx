import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />

  const roles = profile.roles || (profile.role ? [profile.role] : [])

  if (roles.includes('coordenador')) return <Navigate to="/coordinator" replace />
  if (roles.includes('professor')) return <Navigate to="/professor" replace />
  if (roles.includes('avaliador')) return <Navigate to="/avaliador" replace />
  if (roles.includes('fisioterapeuta')) return <Navigate to="/fisioterapeuta" replace />
  if (roles.includes('nutricionista')) return <Navigate to="/nutricionista" replace />

  return <Navigate to="/profile" replace />
}
