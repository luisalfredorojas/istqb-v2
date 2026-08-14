import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection, LegalValue } from './LegalLayout';
import { COMPANY, DATA_PROCESSORS } from '@/lib/legal';

export function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      intro="Cómo tratamos tus datos personales, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD)."
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
                <td className="py-2 pr-4">Email, nombre, contraseña cifrada</td>
                <td className="py-2 pr-4">Crear y gestionar tu cuenta</td>
                <td className="py-2">Ejecución del contrato</td>
              </tr>
              <tr className="border-b border-ds-border">
                <td className="py-2 pr-4">Resultados e intentos de examen</td>
                <td className="py-2 pr-4">Mostrar tu progreso y estadísticas</td>
                <td className="py-2">Ejecución del contrato</td>
              </tr>
              <tr className="border-b border-ds-border">
                <td className="py-2 pr-4">Estado de suscripción y pedidos</td>
                <td className="py-2 pr-4">Gestionar tu plan y el acceso Premium</td>
                <td className="py-2">Ejecución del contrato</td>
              </tr>
              <tr className="border-b border-ds-border">
                <td className="py-2 pr-4">Datos de facturación</td>
                <td className="py-2 pr-4">
                  Tratados directamente por Lemon Squeezy como vendedor
                </td>
                <td className="py-2">Obligación legal</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Solicitudes de desistimiento</td>
                <td className="py-2 pr-4">Atender y acreditar tu solicitud</td>
                <td className="py-2">Obligación legal</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          No tratamos categorías especiales de datos ni tomamos decisiones
          automatizadas con efectos jurídicos sobre ti.
        </p>
      </LegalSection>

      <LegalSection title="3. No guardamos tus datos de pago">
        <p>
          Los pagos los procesa <strong className="text-ds-text">Lemon Squeezy</strong>,
          que actúa como vendedor legal (Merchant of Record). Los datos de tu
          tarjeta se introducen en su entorno seguro y{' '}
          <strong className="text-ds-text">nunca llegan a nuestros servidores</strong>.
          Nosotros solo conservamos el estado de tu suscripción y un
          identificador del pedido.
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
          Conservamos tus datos mientras mantengas la cuenta activa. Si la
          eliminas, se suprimen salvo aquellos que debamos conservar por
          obligación legal (por ejemplo, la facturación durante los plazos
          fiscales, o el registro de solicitudes de desistimiento).
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
          Además, desde{' '}
          <Link to="/profile" className="text-primary hover:underline">
            tu perfil
          </Link>{' '}
          puedes <strong className="text-ds-text">descargar todos tus datos</strong> y{' '}
          <strong className="text-ds-text">eliminar tu cuenta</strong> directamente,
          sin necesidad de solicitarlo.
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
          tránsito (HTTPS), contraseñas almacenadas con funciones de derivación
          seguras y control de acceso a nivel de fila en la base de datos, de
          modo que cada usuario solo puede acceder a sus propios datos.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
