import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import NewEvaluation from './pages/NewEvaluation'
import NotFound from './pages/NotFound'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? children : <Navigate to="/login" />
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
        path="/evaluation/new"
        element={
          <PrivateRoute>
            <NewEvaluation />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
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
