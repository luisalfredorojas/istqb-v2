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
            <h3 className="text-sm font-semibold text-ds-text mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/aviso-legal" className="text-sm text-muted hover:text-primary transition-colors">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-sm text-muted hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-sm text-muted hover:text-primary transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted hover:text-primary transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <a href="mailto:support@testifyhq.com" className="text-sm text-muted hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Botón de desistimiento — Directiva (UE) 2023/2673.
          Debe estar disponible de forma permanente, ser fácilmente accesible
          y tan visible como las funciones de compra.
        */}
        <div className="mt-8 pt-8 border-t border-ds-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted text-center sm:text-left">
            © {new Date().getFullYear()} TestifyHQ. Todos los derechos reservados.
          </p>
          <Link
            to="/desistimiento"
            className="inline-flex items-center justify-center rounded-[8px] border border-ds-border px-4 h-10 text-sm font-medium text-ds-text hover:border-primary hover:text-primary transition-colors"
          >
            Desistir del contrato aquí
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted text-center leading-relaxed max-w-2xl mx-auto">
          TestifyHQ es una plataforma de práctica. No expedimos certificaciones
          ni garantizamos su obtención, y no estamos afiliados a ISTQB® ni a
          ninguna entidad certificadora.
        </p>
      </div>
    </footer>
  );
}
