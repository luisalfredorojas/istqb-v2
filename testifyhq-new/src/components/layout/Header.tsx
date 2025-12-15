import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">TestifyHQ</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/exams"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Exámenes
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Planes
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Acerca de
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
