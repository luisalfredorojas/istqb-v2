import { LegalLayout, LegalSection } from './LegalLayout';
import { COMPANY } from '@/lib/legal';

export function CookiesPage() {
  return (
    <LegalLayout
      title="Política de cookies"
      intro="Información sobre las cookies y tecnologías de almacenamiento que utiliza este sitio, conforme al artículo 22.2 de la LSSI-CE."
    >
      <LegalSection title="1. Qué usamos">
        <p>
          {COMPANY.brand} utiliza únicamente almacenamiento{' '}
          <strong className="text-ds-text">técnico y necesario</strong> para que
          el servicio funcione. No utilizamos cookies de publicidad,
          seguimiento ni elaboración de perfiles, y no compartimos datos de
          navegación con terceros con fines comerciales.
        </p>
      </LegalSection>

      <LegalSection title="2. Detalle">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-ds-border text-ds-text">
                <th className="text-left py-2 pr-4 font-semibold">Nombre</th>
                <th className="text-left py-2 pr-4 font-semibold">Finalidad</th>
                <th className="text-left py-2 pr-4 font-semibold">Tipo</th>
                <th className="text-left py-2 font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ds-border">
                <td className="py-2 pr-4 font-mono text-xs">testifyhq:attempts</td>
                <td className="py-2 pr-4">
                  Guardar en tu navegador los simulacros que has hecho y su
                  resultado, para mostrarte tu progreso sin necesidad de cuenta
                </td>
                <td className="py-2 pr-4">Técnica (necesaria)</td>
                <td className="py-2">Hasta que la borres</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">theme</td>
                <td className="py-2 pr-4">Recordar tu preferencia de tema claro/oscuro</td>
                <td className="py-2 pr-4">Técnica (preferencias)</td>
                <td className="py-2">Persistente</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Estas tecnologías están exentas del deber de consentimiento previo por
          ser estrictamente necesarias para prestar el servicio que solicitas.
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo gestionarlas">
        <p>
          Puedes borrar o bloquear el almacenamiento local desde la configuración
          de tu navegador; también puedes borrar tu historial desde la página de
          progreso. Si lo bloqueas, podrás seguir practicando, pero no se
          guardará el registro de tus simulacros.
        </p>
      </LegalSection>

      <LegalSection title="4. Cambios">
        <p>
          Si en el futuro incorporamos herramientas de analítica o de terceros,
          actualizaremos esta política y solicitaremos tu consentimiento previo
          mediante un banner cuando sea legalmente exigible.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
