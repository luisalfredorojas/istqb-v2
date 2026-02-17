import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-ds-border bg-bg transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-lg font-semibold text-ds-text">TestifyHQ</span>
            </div>
            <p className="text-sm text-muted max-w-md leading-relaxed">
              Plataforma líder de preparación para certificaciones profesionales.
              Mejora tus habilidades y alcanza tus objetivos profesionales.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ds-text mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/exams" className="text-sm text-muted hover:text-primary transition-colors">
                  Exámenes
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted hover:text-primary transition-colors">
                  Planes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ds-text mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted hover:text-primary transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-ds-border">
          <p className="text-sm text-muted text-center">
            © {new Date().getFullYear()} TestifyHQ. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
