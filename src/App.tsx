import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthSuccess from './pages/AuthSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NewEvaluation from './pages/NewEvaluation'
import EditEvaluation from './pages/EditEvaluation'
import EvaluationDetails from './pages/EvaluationDetails'
import NewReevaluation from './pages/NewReevaluation'
import ReevaluationDetails from './pages/ReevaluationDetails'
import ProfessorDashboard from './pages/ProfessorDashboard'
import RoleDashboard from './pages/RoleDashboard'
import Communications from './pages/Communications'
import VideoScheduling from './pages/VideoScheduling'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import CoordinatorDashboard from './pages/CoordinatorDashboard'

// Global error handlers to prevent app crash on Supabase invalid refresh token
if (typeof window !== 'undefined') {
  try {
    let currentVersion = '1f913f6'
    const scriptTags = document.querySelectorAll('script')
    for (let i = 0; i < scriptTags.length; i++) {
      const src = scriptTags[i].getAttribute('src')
      if (src && src.includes('assets/index-')) {
        currentVersion = src
        break
      }
    }

    const storedVersion = localStorage.getItem('app_version_hash')
    if (storedVersion && storedVersion !== currentVersion) {
      let cleaned = false
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => {
        localStorage.removeItem(k)
        cleaned = true
      })
      localStorage.setItem('app_version_hash', currentVersion)
      if (cleaned && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (!storedVersion) {
      localStorage.setItem('app_version_hash', currentVersion)
    }
  } catch (e) {
    // ignore
  }

  const cleanSupabaseAuth = () => {
    try {
      let cleaned = false
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => {
        localStorage.removeItem(k)
        cleaned = true
      })
      if (cleaned && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } catch (e) {
      // ignore
    }
  }

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || event.reason?.toString() || ''
    if (msg.includes('Refresh Token') || msg.includes('AuthApiError')) {
      event.preventDefault()
      cleanSupabaseAuth()
    }
  })

  window.addEventListener('error', (event) => {
    const msg = event.message || event.error?.message || ''
    if (msg.includes('Refresh Token') || msg.includes('AuthApiError')) {
      event.preventDefault()
      cleanSupabaseAuth()
    }
  })

  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    const msgStr = args
      .map((a) => (typeof a === 'string' ? a : a?.message || a?.toString() || ''))
      .join(' ')
    if (msgStr.includes('Refresh Token') || msgStr.includes('AuthApiError')) {
      cleanSupabaseAuth()
      return
    }
    originalConsoleError.apply(console, args)
  }
}

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? children : <Navigate to="/login" />
}

const RoleGuard = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: JSX.Element
}) => {
  const { profile, loading } = useAuth()
  if (loading) return null

  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])
  const hasAccess = userRoles.some((r: string) => allowedRoles.includes(r))

  if (!profile || !hasAccess) {
    return <Navigate to="/" replace />
  }
  return children
}

const RootRedirect = () => {
  const { profile, loading } = useAuth()
  if (loading) return null

  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])

  if (userRoles.includes('coordenador')) return <Navigate to="/coordinator" replace />
  if (userRoles.includes('professor')) return <Navigate to="/professor" replace />
  if (userRoles.includes('avaliador')) return <Navigate to="/avaliador" replace />
  if (userRoles.includes('fisioterapeuta')) return <Navigate to="/fisioterapeuta" replace />
  if (userRoles.includes('nutricionista')) return <Navigate to="/nutricionista" replace />

  return <Navigate to="/profile" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <RootRedirect />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/professor"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['professor', 'coordenador']}>
              <ProfessorDashboard />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/avaliador"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['avaliador', 'coordenador']}>
              <RoleDashboard />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/fisioterapeuta"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['fisioterapeuta', 'coordenador']}>
              <RoleDashboard />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/nutricionista"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['nutricionista', 'coordenador']}>
              <RoleDashboard />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/coordinator"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['coordenador']}>
              <CoordinatorDashboard />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/communications"
        element={
          <PrivateRoute>
            <RoleGuard
              allowedRoles={[
                'coordenador',
                'professor',
                'avaliador',
                'fisioterapeuta',
                'nutricionista',
              ]}
            >
              <Communications />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['coordenador']}>
              <VideoScheduling />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluation/new"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['avaliador', 'coordenador']}>
              <NewEvaluation />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluation/edit/:id"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['avaliador', 'coordenador', 'professor']}>
              <EditEvaluation />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluation/:id"
        element={
          <PrivateRoute>
            <EvaluationDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluation/:id/reevaluate"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['avaliador', 'coordenador']}>
              <NewReevaluation />
            </RoleGuard>
          </PrivateRoute>
        }
      />
      <Route
        path="/reevaluation/:id"
        element={
          <PrivateRoute>
            <ReevaluationDetails />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
