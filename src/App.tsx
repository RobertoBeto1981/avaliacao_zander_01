import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
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
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Index />
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
            <RoleGuard allowedRoles={['coordenador']}>
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
