import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './hooks/useTheme';
import { LanguageProvider } from './hooks/useLanguage';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamListPage } from './pages/ExamListPage';
import { ExamPage } from './pages/ExamPage';
import { ResultsPage } from './pages/ResultsPage';
import { AvisoLegalPage } from './pages/legal/AvisoLegalPage';
import { PrivacidadPage } from './pages/legal/PrivacidadPage';
import { TerminosPage } from './pages/legal/TerminosPage';
import { CookiesPage } from './pages/legal/CookiesPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ExamManagementPage } from './pages/admin/ExamManagementPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Todo el contenido es público y gratuito: sin cuentas ni planes. */}
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/exams" element={<ExamListPage />} />
            <Route path="/exam/:id" element={
              <ErrorBoundary>
                <ExamPage />
              </ErrorBoundary>
            } />
            <Route path="/results/:id" element={<ResultsPage />} />
            {/* Legal */}
            <Route path="/aviso-legal" element={<AvisoLegalPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            {/* Rutas antiguas del footer, para no romper enlaces existentes */}
            <Route path="/privacy" element={<PrivacidadPage />} />
            {/*
              Administración. El sitio público no tiene login: estas rutas no
              se enlazan desde ninguna parte y existen solo para que el
              administrador pueda entrar a gestionar e importar exámenes, algo
              que la base de datos exige hacer con una sesión de admin.
            */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin/exams" element={<ExamManagementPage />} />
            <Route path="*" element={<div className="container mx-auto px-4 py-12 text-center"><h1 className="text-4xl font-bold">404 - Página no encontrada</h1></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
