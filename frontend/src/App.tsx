import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { I18nProvider } from './i18n/I18nContext'
import { seedIfNeeded } from './store/seedData'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import SearchPage from './pages/SearchPage'
import TrailsPage from './pages/TrailsPage'
import MentoringPage from './pages/MentoringPage'
import DashboardPage from './pages/DashboardPage'
import MessagesPage from './pages/MessagesPage'
import MapPage from './pages/MapPage'
import PlanningPage from './pages/PlanningPage'
import PodcastPage from './pages/PodcastPage'
import LeadersPage from './pages/LeadersPage'
import ContentPlayerPage from './pages/ContentPlayerPage'
import ManagementPage from './pages/ManagementPage'
import MaterialsPage from './pages/MaterialsPage'
import AdminPage from './pages/AdminPage'
import PreviewNewUI from './pages/PreviewNewUI'
import PreviewDark from './pages/PreviewDark'
import PreviewEditorial from './pages/PreviewEditorial'
import PreviewPlanA from './pages/PreviewPlanA'
import PreviewPlanB from './pages/PreviewPlanB'
import PreviewPlanC from './pages/PreviewPlanC'
import PreviewMatA from './pages/PreviewMatA'
import PreviewMatB from './pages/PreviewMatB'
import PreviewMatC from './pages/PreviewMatC'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  useEffect(() => { seedIfNeeded() }, [])

  return (
    <I18nProvider>
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Protected><HomePage /></Protected>} />
            <Route path="/registro" element={<Protected><RegisterPage /></Protected>} />
            <Route path="/catalogo" element={<Protected><CatalogPage /></Protected>} />
            <Route path="/conteudo/:id" element={<Protected><ContentPlayerPage /></Protected>} />
            <Route path="/busca" element={<Protected><SearchPage /></Protected>} />
            <Route path="/trilhas" element={<Protected><TrailsPage /></Protected>} />
            <Route path="/mentorias" element={<Protected><MentoringPage /></Protected>} />
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/mensagens" element={<Protected><MessagesPage /></Protected>} />
            <Route path="/mapa" element={<Protected><MapPage /></Protected>} />
            <Route path="/planejamento" element={<Protected><PlanningPage /></Protected>} />
            <Route path="/podcast" element={<Protected><PodcastPage /></Protected>} />
            <Route path="/lideres" element={<Protected><LeadersPage /></Protected>} />
            <Route path="/gestao" element={<Protected><ManagementPage /></Protected>} />
            <Route path="/materiais" element={<Protected><MaterialsPage /></Protected>} />
            <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
            <Route path="/preview-new" element={<PreviewNewUI />} />
            <Route path="/preview-dark" element={<PreviewDark />} />
            <Route path="/preview-editorial" element={<PreviewEditorial />} />
            <Route path="/preview-plan-a" element={<Protected><PreviewPlanA /></Protected>} />
            <Route path="/preview-plan-b" element={<Protected><PreviewPlanB /></Protected>} />
            <Route path="/preview-plan-c" element={<Protected><PreviewPlanC /></Protected>} />
            <Route path="/preview-mat-a" element={<Protected><PreviewMatA /></Protected>} />
            <Route path="/preview-mat-b" element={<Protected><PreviewMatB /></Protected>} />
            <Route path="/preview-mat-c" element={<Protected><PreviewMatC /></Protected>} />
          </Routes>
        </div>
      </DataProvider>
    </AuthProvider>
    </I18nProvider>
  )
}
