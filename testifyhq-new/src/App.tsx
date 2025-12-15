import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamListPage } from './pages/ExamListPage';
import { PricingPage } from './pages/PricingPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/exams" element={<ExamListPage />} />
            <Route path="*" element={<div className="container mx-auto px-4 py-12 text-center"><h1 className="text-4xl font-bold">404 - Página no encontrada</h1></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
