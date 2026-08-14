import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection, LegalValue } from './LegalLayout';
import { COMPANY } from '@/lib/legal';
import { PLANS } from '@/lib/payments';
import { AlertTriangle } from 'lucide-react';

export function TerminosPage() {
  const monthly = PLANS.find((p) => p.id === 'monthly');

  return (
    <LegalLayout
      title="Términos y condiciones"
      intro="Condiciones de uso y de contratación del servicio. Te recomendamos leerlas antes de suscribirte."
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
          Estas condiciones regulan el uso de la plataforma y la contratación de
          la suscripción Premium.
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

      <LegalSection title="3. Cuenta de usuario">
        <p>
          Para acceder necesitas registrarte con un correo válido. Eres
          responsable de la confidencialidad de tus credenciales y de la
          actividad realizada desde tu cuenta. Debes ser mayor de edad o contar
          con autorización de tu representante legal.
        </p>
      </LegalSection>

      <LegalSection title="4. Planes y precios">
        <p>
          Existe un <strong className="text-ds-text">plan gratuito</strong> que
          permite practicar únicamente el Examen A, con un máximo de 2
          simulacros.
        </p>
        <p>
          El <strong className="text-ds-text">plan Premium</strong> cuesta{' '}
          <strong className="text-ds-text">{monthly?.price ?? '7,99 €'} al mes</strong> y
          da acceso ilimitado a todos los exámenes disponibles. Los impuestos
          aplicables se calculan y muestran en el proceso de pago según tu país
          de residencia.
        </p>
      </LegalSection>

      <LegalSection title="5. Contratación, renovación automática y cancelación">
        <p>
          La suscripción es de{' '}
          <strong className="text-ds-text">renovación automática mensual</strong>:
          se renovará por periodos sucesivos de un mes y se cobrará el importe
          vigente en cada renovación, salvo que la canceles antes.
        </p>
        <p>
          Puedes <strong className="text-ds-text">cancelar en cualquier momento y
          con un solo clic</strong> desde{' '}
          <Link to="/profile" className="text-primary hover:underline">
            tu perfil
          </Link>
          , sin necesidad de llamar ni escribir. Tras cancelar no se realizarán
          nuevos cobros y conservarás el acceso Premium hasta el final del
          periodo que ya hayas pagado.
        </p>
        <p>
          Si modificamos el precio, te lo comunicaremos con antelación
          suficiente para que puedas cancelar antes de que se aplique.
        </p>
      </LegalSection>

      <LegalSection title="6. Pago y facturación">
        <p>
          Los pagos se procesan a través de{' '}
          <strong className="text-ds-text">Lemon Squeezy</strong>, que actúa como
          vendedor legal (Merchant of Record) y es quien emite la factura y
          gestiona los impuestos aplicables. No almacenamos los datos de tu
          tarjeta.
        </p>
      </LegalSection>

      <LegalSection title="7. Derecho de desistimiento">
        <p>
          Como consumidor tienes derecho a desistir del contrato en un plazo de{' '}
          <strong className="text-ds-text">14 días naturales</strong> desde su
          celebración, sin necesidad de justificación.
        </p>
        <p>
          Puedes ejercerlo de forma inmediata desde{' '}
          <Link to="/desistimiento" className="text-primary hover:underline font-medium">
            Desistir del contrato aquí
          </Link>
          , enlace disponible de forma permanente en el pie de página. Recibirás
          un acuse de recibo con la fecha y hora de tu solicitud.
        </p>
        <p>
          Ten en cuenta que, tratándose de contenido digital de acceso inmediato,
          el derecho de desistimiento puede decaer si solicitas expresamente el
          acceso inmediato y reconoces perderlo, conforme al artículo 103.m) del
          TRLGDCU. Los reembolsos se tramitan a través de Lemon Squeezy como
          vendedor.
        </p>
      </LegalSection>

      <LegalSection title="8. Uso permitido">
        <p>
          El acceso es personal e intransferible. No está permitido compartir la
          cuenta, ni copiar, redistribuir, revender o publicar los contenidos y
          preguntas de la plataforma, ni emplear medios automatizados para
          extraerlos.
        </p>
        <p>
          El incumplimiento puede conllevar la suspensión o cancelación de la
          cuenta sin derecho a reembolso del periodo en curso.
        </p>
      </LegalSection>

      <LegalSection title="9. Disponibilidad y modificaciones">
        <p>
          Procuramos mantener el servicio disponible de forma continuada, pero no
          garantizamos la ausencia de interrupciones por mantenimiento o causas
          técnicas. Podemos modificar o actualizar los contenidos y funciones
          para mejorar el servicio.
        </p>
      </LegalSection>

      <LegalSection title="10. Protección de datos">
        <p>
          El tratamiento de tus datos se describe en la{' '}
          <Link to="/privacidad" className="text-primary hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="11. Legislación aplicable y reclamaciones">
        <p>
          Estas condiciones se rigen por la legislación española. Como
          consumidor, puedes dirigir cualquier reclamación a{' '}
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
