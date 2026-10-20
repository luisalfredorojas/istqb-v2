import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/lib/supabase';

/**
 * Uso de cada examen a partir de los avisos anónimos de `exam_events`.
 * La vista respeta el RLS: solo un administrador obtiene filas.
 */
export function ExamStatsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole(user?.id);
  const isAdmin = !!user && !!roleData?.isAdmin;

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) navigate('/login');
    else if (!roleData?.isAdmin) navigate('/exams');
  }, [authLoading, roleLoading, roleData, user, navigate]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['exam_event_stats'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_event_stats')
        .select('*')
        .order('started', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (authLoading || roleLoading || !isAdmin) {
    return <p className="container mx-auto px-4 py-8 text-muted">Verificando permisos...</p>;
  }

  const totals = (stats ?? []).reduce(
    (acc, s) => ({
      started: acc.started + s.started,
      completed: acc.completed + s.completed,
      started30d: acc.started30d + s.started_30d,
      returning: acc.returning + s.completed_by_returning,
    }),
    { started: 0, completed: 0, started30d: 0, returning: 0 }
  );
  const pct = (part: number, whole: number) =>
    whole > 0 ? `${Math.round((100 * part) / whole)}%` : '—';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ds-text">Uso de los exámenes</h1>
          <p className="text-muted mt-1">
            Avisos anónimos de inicio y fin de cada simulacro.
          </p>
        </div>
        <Link to="/admin/exams" className="text-primary hover:underline">
          ← Gestión de exámenes
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="Simulacros empezados" value={totals.started} />
        <Kpi label="Empezados (30 días)" value={totals.started30d} />
        <Kpi label="Terminados" value={`${totals.completed} (${pct(totals.completed, totals.started)})`} />
        <Kpi
          label="Terminados por quien ya llevaba 2+"
          value={pct(totals.returning, totals.completed)}
        />
      </div>

      {isLoading && <p className="text-muted">Cargando…</p>}
      {error && <p className="text-danger">No se pudieron cargar las estadísticas.</p>}

      {stats && (
        <div className="overflow-x-auto bg-surface border border-ds-border rounded-[12px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ds-border text-ds-text text-left">
                <th className="p-3 font-semibold">Examen</th>
                <th className="p-3 font-semibold text-right">Empezados</th>
                <th className="p-3 font-semibold text-right">7 días</th>
                <th className="p-3 font-semibold text-right">30 días</th>
                <th className="p-3 font-semibold text-right">Terminados</th>
                <th className="p-3 font-semibold text-right">Nota media</th>
                <th className="p-3 font-semibold text-right">Aprobados</th>
                <th className="p-3 font-semibold text-right">Último uso</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {stats.map((s) => (
                <tr key={s.exam_id} className="border-b border-ds-border last:border-0">
                  <td className="p-3 text-ds-text">
                    {s.title}{' '}
                    <span className="text-xs uppercase text-muted">{s.language}</span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{s.started}</td>
                  <td className="p-3 text-right tabular-nums">{s.started_7d}</td>
                  <td className="p-3 text-right tabular-nums">{s.started_30d}</td>
                  <td className="p-3 text-right tabular-nums">
                    {s.completed} <span className="text-xs">({pct(s.completed, s.started)})</span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{s.avg_score ?? '—'}</td>
                  <td className="p-3 text-right tabular-nums">
                    {s.pass_rate == null ? '—' : `${s.pass_rate}%`}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {s.last_event_at ? new Date(s.last_event_at).toLocaleDateString('es') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-ds-border rounded-[12px] p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold text-ds-text tabular-nums mt-1">{value}</p>
    </div>
  );
}
