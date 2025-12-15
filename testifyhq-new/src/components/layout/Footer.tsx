import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TestifyHQ</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Plataforma líder de preparación para certificaciones profesionales.
              Mejora tus habilidades y alcanza tus objetivos profesionales.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/exams" className="text-sm text-gray-600 hover:text-primary-600">
                  Exámenes
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 hover:text-primary-600">
                  Planes
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-gray-600 hover:text-primary-600">
                  Características
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} TestifyHQ. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
