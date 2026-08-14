import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection, LegalValue } from './LegalLayout';
import { COMPANY } from '@/lib/legal';

export function AvisoLegalPage() {
  return (
    <LegalLayout
      title="Aviso legal"
      intro="Información general del titular de este sitio web, en cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE)."
    >
      <LegalSection title="1. Titular del sitio web">
        <ul className="space-y-2">
          <li>
            Denominación: <LegalValue value={COMPANY.legalName} />
          </li>
          <li>
            NIF/CIF: <LegalValue value={COMPANY.taxId} />
          </li>
          <li>
            Domicilio: <LegalValue value={COMPANY.address} />
          </li>
          <li>
            Correo electrónico:{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
          </li>
          <li>
            Sitio web: <span className="text-ds-text font-medium">{COMPANY.site}</span>
          </li>
          {COMPANY.registry && <li>Datos registrales: {COMPANY.registry}</li>}
        </ul>
      </LegalSection>

      <LegalSection title="2. Objeto y ámbito de aplicación">
        <p>
          El presente aviso legal regula el acceso y uso de {COMPANY.brand}, una
          plataforma de práctica y autoevaluación mediante simulacros de examen.
          El acceso al sitio atribuye la condición de usuario e implica la
          aceptación de las condiciones aquí recogidas.
        </p>
      </LegalSection>

      <LegalSection title="3. Naturaleza del servicio">
        <p>
          {COMPANY.brand} es una herramienta de <strong className="text-ds-text">preparación
          y práctica</strong>. No es una entidad certificadora, no está afiliada
          a ISTQB® ni a ningún organismo de certificación, y{' '}
          <strong className="text-ds-text">no expide certificaciones ni garantiza
          la obtención de ninguna</strong>. Puedes consultar el detalle en los{' '}
          <Link to="/terminos" className="text-primary hover:underline">
            términos y condiciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <p>
          Los contenidos del sitio (textos, diseño, código y elementos gráficos)
          pertenecen a su titular o se utilizan con la autorización
          correspondiente. Queda prohibida su reproducción, distribución o
          transformación sin autorización expresa.
        </p>
        <p>
          ISTQB® es una marca registrada de International Software Testing
          Qualifications Board. Su mención en este sitio es meramente
          descriptiva e identificativa del temario que se practica, sin implicar
          vínculo, patrocinio ni aprobación alguna.
        </p>
      </LegalSection>

      <LegalSection title="5. Responsabilidad">
        <p>
          El titular no se hace responsable del uso que los usuarios hagan de los
          contenidos, ni garantiza la disponibilidad ininterrumpida del servicio,
          si bien procurará mantenerlo operativo y actualizado.
        </p>
      </LegalSection>

      <LegalSection title="6. Legislación aplicable">
        <p>
          Esta relación se rige por la legislación española. Para la resolución
          de conflictos, las partes se someten a los juzgados y tribunales que
          correspondan conforme a la normativa de consumidores y usuarios.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
