import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ds-text transition-colors">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!isHomePage && <Footer />}
    </div>
  );
}
