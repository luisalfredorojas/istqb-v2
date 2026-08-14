import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { cancelSubscription, getCustomerPortalUrl } from '@/lib/payments';
import { exportUserData, deleteAccount } from '@/lib/gdpr';
import { authHelpers } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import {
  Crown,
  Loader2,
  CreditCard,
  AlertTriangle,
  Check,
  Download,
  Trash2,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  trialing: 'Periodo de prueba',
  past_due: 'Pago pendiente',
  paused: 'Pausada',
  cancelled: 'Cancelada (activa hasta fin de periodo)',
  expired: 'Expirada',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const { data: subscription } = useSubscription();
  const { data: roleData } = useUserRole(user?.id);
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const [resetSent, setResetSent] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setDisplayName(profile.displayName ?? '');
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavedMsg(false);
    try {
      await updateProfile.mutateAsync({ displayName: displayName.trim() });
      setSavedMsg(true);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'No se pudieron guardar los cambios'
      );
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      await authHelpers.resetPassword(profile.email);
      setResetSent(true);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'No se pudo enviar el email'
      );
    }
  };

  const handleCancel = async () => {
    setSubError(null);
    setCancelling(true);
    try {
      await cancelSubscription();
      setConfirmCancel(false);
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    } catch (err) {
      setSubError(
        err instanceof Error ? err.message : 'No se pudo cancelar la suscripción'
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setDataError(null);
    setExporting(true);
    try {
      await exportUserData(user.id);
    } catch (err) {
      setDataError(
        err instanceof Error ? err.message : 'No se pudieron exportar tus datos'
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDataError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      // La sesión ya se cerró; recargamos en la home.
      window.location.assign('/');
    } catch (err) {
      setDataError(
        err instanceof Error ? err.message : 'No se pudo eliminar la cuenta'
      );
      setDeleting(false);
    }
  };

  const handlePortal = async () => {
    setSubError(null);
    setPortalLoading(true);
    try {
      const url = await getCustomerPortalUrl();
      window.location.assign(url);
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'No se pudo abrir el portal');
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ds-border border-t-primary" />
      </div>
    );
  }

  // El acceso completo puede venir de una suscripción o del rol de admin.
  // Se muestran por separado para que el estado real quede claro.
  const isPremium = subscription?.isPremium ?? false;
  const isAdmin = roleData?.isAdmin ?? false;
  const isCancelled = subscription?.status === 'cancelled';
  const canCancel = isPremium && !subscription?.isLifetime && !isCancelled;

  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ds-text mb-2">Mi cuenta</h1>
          <p className="text-muted">Gestiona tus datos personales y tu suscripción</p>
        </div>

        {/* ---------------- Datos personales ---------------- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>Actualiza la información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setSavedMsg(false);
                  }}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email ?? ''} disabled />
                <p className="text-xs text-muted">
                  Para cambiar tu email, escríbenos a support@testifyhq.com
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
                {savedMsg && (
                  <span className="text-sm text-success inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Guardado
                  </span>
                )}
              </div>

              {profileError && (
                <p className="text-sm text-danger" role="alert">
                  {profileError}
                </p>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-ds-border">
              <h3 className="text-sm font-semibold text-ds-text mb-2">Contraseña</h3>
              {resetSent ? (
                <p className="text-sm text-success">
                  Te hemos enviado un email para restablecer tu contraseña.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted mb-3">
                    Te enviaremos un enlace para cambiarla de forma segura.
                  </p>
                  <Button variant="outline" onClick={handlePasswordReset}>
                    Cambiar contraseña
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------------- Suscripción ---------------- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
            <CardDescription>Estado de tu plan y facturación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* El acceso de administrador es independiente de la suscripción */}
            {isAdmin && (
              <div className="flex items-start gap-3 p-4 rounded-[8px] bg-primary-soft">
                <Crown className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ds-text">Acceso de administrador</p>
                  <p className="text-sm text-muted">
                    Tienes acceso completo a todos los exámenes por tu rol, sin
                    necesidad de suscripción.
                  </p>
                </div>
              </div>
            )}

            {isPremium ? (
              <>
                <div className="flex items-start gap-3 p-4 rounded-[8px] bg-success-soft">
                  <Crown className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ds-text">
                      {subscription?.isLifetime ? 'Premium de por vida' : 'Premium activo'}
                    </p>
                    <p className="text-sm text-muted">
                      Acceso ilimitado a todos los exámenes.
                    </p>
                  </div>
                </div>

                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted">Estado</dt>
                    <dd className="font-medium text-ds-text">
                      {subscription?.isLifetime
                        ? 'Pago único'
                        : STATUS_LABEL[subscription?.status ?? ''] ?? '—'}
                    </dd>
                  </div>
                  {!subscription?.isLifetime && (
                    <div>
                      <dt className="text-muted">
                        {isCancelled ? 'Acceso hasta' : 'Se renueva el'}
                      </dt>
                      <dd className="font-medium text-ds-text">
                        {formatDate(subscription?.currentPeriodEnd ?? null)}
                      </dd>
                    </div>
                  )}
                </dl>

                {isCancelled && (
                  <div className="p-4 rounded-[8px] border border-ds-border text-sm text-muted">
                    Tu suscripción está cancelada y no se renovará. Mantienes el
                    acceso Premium hasta el{' '}
                    <strong className="text-ds-text">
                      {formatDate(subscription?.currentPeriodEnd ?? null)}
                    </strong>
                    .
                  </div>
                )}

                {!subscription?.isLifetime && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePortal}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Abriendo...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Facturas y método de pago
                        </>
                      )}
                    </Button>

                    {canCancel && !confirmCancel && (
                      <Button
                        variant="ghost"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => setConfirmCancel(true)}
                      >
                        Cancelar suscripción
                      </Button>
                    )}
                  </div>
                )}

                {confirmCancel && (
                  <div className="p-4 rounded-[8px] border border-danger/40 bg-danger/5 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-ds-text mb-1">
                          ¿Cancelar tu suscripción?
                        </p>
                        <p className="text-muted">
                          No se te volverá a cobrar. Conservarás el acceso Premium
                          hasta el{' '}
                          <strong className="text-ds-text">
                            {formatDate(subscription?.currentPeriodEnd ?? null)}
                          </strong>
                          , y después tu cuenta volverá al plan gratuito.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Sí, cancelar suscripción'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmCancel(false)}
                        disabled={cancelling}
                      >
                        Mantener suscripción
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-ds-text font-medium mb-1">
                  {isAdmin ? 'Sin suscripción activa' : 'Plan gratuito'}
                </p>
                <p className="text-sm text-muted mb-5">
                  {isAdmin
                    ? 'No tienes ninguna suscripción contratada. Tu acceso proviene del rol de administrador.'
                    : 'Solo el Examen A, con un máximo de 2 simulacros.'}
                </p>
                {!isAdmin && (
                  <Link to="/pricing">
                    <Button>
                      <Crown className="w-4 h-4 mr-2" />
                      Hazte Premium
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {subError && (
              <p className="text-sm text-danger" role="alert">
                {subError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ---------------- Tus datos (RGPD) ---------------- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tus datos</CardTitle>
            <CardDescription>
              Ejerce tus derechos de acceso, portabilidad y supresión (RGPD)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-ds-text mb-2">
                Descargar mis datos
              </h3>
              <p className="text-sm text-muted mb-3">
                Obtén una copia en formato JSON de tu perfil, tus intentos de
                examen y tus pedidos.
              </p>
              <Button variant="outline" onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar mis datos
                  </>
                )}
              </Button>
            </div>

            <div className="pt-6 border-t border-ds-border">
              <h3 className="text-sm font-semibold text-danger mb-2">
                Eliminar mi cuenta
              </h3>
              <p className="text-sm text-muted mb-3">
                Se borrarán tu perfil, tu historial de exámenes y tus datos
                asociados. Si tienes una suscripción activa, se cancelará
                automáticamente. Esta acción no se puede deshacer.
              </p>

              {!confirmDelete ? (
                <Button
                  variant="ghost"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar mi cuenta
                </Button>
              ) : (
                <div className="p-4 rounded-[8px] border border-danger/40 bg-danger/5 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted">
                      Para confirmar, escribe{' '}
                      <strong className="text-ds-text">ELIMINAR</strong> en el
                      campo de abajo.
                    </p>
                  </div>
                  <Input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="ELIMINAR"
                    aria-label="Escribe ELIMINAR para confirmar"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteText.trim() !== 'ELIMINAR' || deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar definitivamente'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setConfirmDelete(false);
                        setDeleteText('');
                      }}
                      disabled={deleting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {dataError && (
              <p className="text-sm text-danger" role="alert">
                {dataError}
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-muted text-center">
          ¿Necesitas ayuda? Escríbenos a support@testifyhq.com ·{' '}
          <Link to="/desistimiento" className="text-primary hover:underline">
            Desistir del contrato
          </Link>
        </p>
      </div>
    </div>
  );
}
