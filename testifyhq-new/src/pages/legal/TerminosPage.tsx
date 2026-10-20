import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection, LegalValue } from './LegalLayout';
import { COMPANY } from '@/lib/legal';
import { AlertTriangle } from 'lucide-react';

export function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      intro="Condiciones de uso del servicio. El acceso es gratuito y no requiere registro."
    >
      {/* Descargo destacado: qué es y qué NO es este servicio */}
      <div className="p-5 rounded-[12px] border border-primary-soft-border bg-primary-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-ds-text mb-2">
              Importante: qué es y qué no es {COMPANY.brand}
            </h2>
            <p className="text-muted leading-relaxed">
              {COMPANY.brand} es una plataforma de{' '}
              <strong className="text-ds-text">práctica con simulacros de examen</strong>{' '}
              para ayudarte a prepararte.{' '}
              <strong className="text-ds-text">
                No expedimos ninguna certificación, no somos un centro examinador
                y no garantizamos que vayas a aprobar ni a obtener ninguna
                certificación oficial.
              </strong>{' '}
              Para certificarte debes inscribirte y examinarte a través de las
              entidades oficiales correspondientes.
            </p>
          </div>
        </div>
      </div>

      <LegalSection title="1. Titular y objeto">
        <p>
          El titular del servicio es <LegalValue value={COMPANY.legalName} /> (NIF{' '}
          <LegalValue value={COMPANY.taxId} />), con domicilio en{' '}
          <LegalValue value={COMPANY.address} /> y correo de contacto{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
            {COMPANY.email}
          </a>
          .
        </p>
        <p>
          Estas condiciones regulan el uso de la plataforma, que se ofrece de
          forma gratuita.
        </p>
      </LegalSection>

      <LegalSection title="2. Naturaleza del servicio y ausencia de garantía de resultado">
        <p>
          El servicio consiste en el acceso a simulacros de examen, preguntas de
          práctica y sus explicaciones, con fines exclusivamente formativos y de
          autoevaluación.
        </p>
        <p>
          {COMPANY.brand} <strong className="text-ds-text">no es una entidad
          certificadora</strong> y{' '}
          <strong className="text-ds-text">no está afiliada, patrocinada ni
          avalada por ISTQB®</strong> ni por ningún otro organismo de
          certificación. Las marcas mencionadas pertenecen a sus respectivos
          titulares y se citan de forma meramente descriptiva.
        </p>
        <p>
          El resultado obtenido en nuestros simulacros{' '}
          <strong className="text-ds-text">no tiene validez oficial</strong>, no
          sustituye al examen oficial y no supone garantía alguna sobre el
          resultado que puedas obtener en él. El aprovechamiento depende del
          estudio y esfuerzo de cada usuario.
        </p>
        <p>
          El contenido puede no reflejar la versión más reciente del temario
          oficial. Es responsabilidad del usuario verificar el temario vigente
          con la entidad certificadora.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceso gratuito y sin registro">
        <p>
          Todos los exámenes son{' '}
          <strong className="text-ds-text">gratuitos y de acceso libre</strong>:
          no hay planes de pago, no se cobra ningún importe y no es necesario
          crear una cuenta ni facilitar datos personales para practicar.
        </p>
        <p>
          Tu progreso (los simulacros realizados y sus resultados) se guarda{' '}
          <strong className="text-ds-text">en el almacenamiento local de tu
          propio navegador</strong>. No se envía a nuestros servidores, no viaja
          entre dispositivos y se pierde si borras los datos del sitio. Solo
          recibimos un aviso anónimo al empezar y terminar cada simulacro, sin
          tus respuestas ni datos que te identifiquen, como se explica en la
          Política de Privacidad.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso permitido">
        <p>
          No está permitido copiar, redistribuir, revender o publicar los
          contenidos y preguntas de la plataforma, ni emplear medios
          automatizados para extraerlos.
        </p>
        <p>
          Podemos restringir el acceso ante un uso que perjudique el servicio o
          a otros usuarios.
        </p>
      </LegalSection>

      <LegalSection title="5. Disponibilidad y modificaciones">
        <p>
          Procuramos mantener el servicio disponible de forma continuada, pero no
          garantizamos la ausencia de interrupciones por mantenimiento o causas
          técnicas. Al tratarse de un servicio gratuito, podemos modificar,
          suspender o retirar contenidos y funciones en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="6. Protección de datos">
        <p>
          El tratamiento de datos se describe en la{' '}
          <Link to="/privacidad" className="text-primary hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Legislación aplicable y reclamaciones">
        <p>
          Estas condiciones se rigen por la legislación española. Puedes dirigir
          cualquier reclamación a{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
            {COMPANY.email}
          </a>
          . También puedes acudir a la plataforma de resolución de litigios en
          línea de la Comisión Europea.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
