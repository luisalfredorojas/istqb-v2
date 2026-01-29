import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamListPage } from './pages/ExamListPage';
import { ExamPage } from './pages/ExamPage';
import { ResultsPage } from './pages/ResultsPage';
import { PricingPage } from './pages/PricingPage';
import { ExamManagementPage } from './pages/admin/ExamManagementPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/donate" element={<PricingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/exams" element={<ProtectedRoute><ExamListPage /></ProtectedRoute>} />
            <Route path="/exam/:id" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ExamPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/exams" element={<ProtectedRoute><ExamManagementPage /></ProtectedRoute>} />
            <Route path="*" element={<div className="container mx-auto px-4 py-12 text-center"><h1 className="text-4xl font-bold">404 - Página no encontrada</h1></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
