import { LegalLayout, LegalSection, LegalValue } from './LegalLayout';
import { COMPANY, DATA_PROCESSORS } from '@/lib/legal';

export function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      intro="La plataforma es gratuita y no requiere registro: apenas tratamos datos personales. Esto es lo que hay, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD)."
    >
      <LegalSection title="1. Responsable del tratamiento">
        <ul className="space-y-2">
          <li>
            Responsable: <LegalValue value={COMPANY.legalName} />
          </li>
          <li>
            NIF/CIF: <LegalValue value={COMPANY.taxId} />
          </li>
          <li>
            Dirección: <LegalValue value={COMPANY.address} />
          </li>
          <li>
            Contacto:{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Datos que tratamos y para qué">
        <p>
          Para usar la plataforma <strong className="text-ds-text">no te pedimos
          ningún dato personal</strong>: no hay registro, ni cuentas, ni pagos.
          Puedes practicar de forma anónima.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-ds-border text-ds-text">
                <th className="text-left py-2 pr-4 font-semibold">Datos</th>
                <th className="text-left py-2 pr-4 font-semibold">Finalidad</th>
                <th className="text-left py-2 font-semibold">Base jurídica</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ds-border">
                <td className="py-2 pr-4">
                  Resultados de tus simulacros y preferencias (idioma, tema)
                </td>
                <td className="py-2 pr-4">
                  Mostrarte tu progreso. Se guardan solo en tu navegador y nunca
                  llegan a nuestros servidores
                </td>
                <td className="py-2">Interés legítimo (almacenamiento técnico)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">
                  Datos técnicos de conexión (IP, navegador) en los registros del
                  servidor
                </td>
                <td className="py-2 pr-4">
                  Servir el sitio y mantener su seguridad
                </td>
                <td className="py-2">Interés legítimo</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          No elaboramos perfiles, no hacemos publicidad, no vendemos datos y no
          tomamos decisiones automatizadas con efectos jurídicos sobre ti.
        </p>
      </LegalSection>

      <LegalSection title="3. Tu progreso no sale de tu dispositivo">
        <p>
          El historial de simulacros se guarda en el{' '}
          <strong className="text-ds-text">almacenamiento local de tu
          navegador</strong>. Solo tú puedes verlo, no viaja a ningún servidor y
          desaparece cuando borras los datos del sitio o usas el botón
          «Borrar mi historial» de la página de progreso.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinatarios y encargados del tratamiento">
        <p>Para prestar el servicio trabajamos con los siguientes proveedores:</p>
        <ul className="space-y-2">
          {DATA_PROCESSORS.map((p) => (
            <li key={p.name}>
              <strong className="text-ds-text">{p.name}</strong> — {p.purpose}.{' '}
              <span className="text-sm">({p.location})</span>
            </li>
          ))}
        </ul>
        <p>
          Algunos proveedores están ubicados fuera del Espacio Económico Europeo.
          En esos casos, las transferencias se amparan en cláusulas contractuales
          tipo aprobadas por la Comisión Europea u otras garantías adecuadas.
        </p>
      </LegalSection>

      <LegalSection title="5. Conservación">
        <p>
          No conservamos datos personales tuyos en nuestros sistemas, porque no
          los recogemos. Los registros técnicos del servidor se conservan
          durante el tiempo estrictamente necesario para garantizar la seguridad
          del servicio. Lo que guarda tu navegador permanece hasta que tú lo
          borres.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión,
          oposición, limitación y portabilidad escribiendo a{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
            {COMPANY.email}
          </a>
          .
        </p>
        <p>
          Ten en cuenta que, al no existir cuentas de usuario, en la mayoría de
          los casos no podremos identificarte ni asociar ningún dato contigo
          (art. 11 RGPD). Tu historial de práctica puedes borrarlo tú mismo en
          cualquier momento desde la página de progreso.
        </p>
        <p>
          Si consideras que no hemos atendido correctamente tu solicitud, puedes
          reclamar ante la Agencia Española de Protección de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            aepd.es
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas apropiadas: cifrado en
          tránsito (HTTPS) y control de acceso a nivel de fila en la base de
          datos, que solo permite lectura del contenido público de los exámenes.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
