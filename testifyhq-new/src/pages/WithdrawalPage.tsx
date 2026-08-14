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
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { COMPANY } from '@/lib/legal';
import { CheckCircle, Loader2, FileText } from 'lucide-react';

interface Acknowledgment {
  reference: string;
  acknowledgedAt: string;
  fullName: string;
  email: string;
  orderReference: string;
  message: string;
}

/**
 * Formulario de desistimiento exigido por la Directiva (UE) 2023/2673,
 * obligatorio desde el 19/06/2026.
 *
 * Requisitos cubiertos: accesible sin necesidad de iniciar sesión, solo pide
 * nombre, datos del pedido y email, y tras confirmar muestra un acuse de
 * recibo inmediato con fecha, hora y contenido de la solicitud.
 */
export function WithdrawalPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ack, setAck] = useState<Acknowledgment | null>(null);

  // Prerrellena si el usuario ha iniciado sesión (nunca es obligatorio).
  useEffect(() => {
    if (profile) {
      setFullName((prev) => prev || profile.displayName || '');
      setEmail((prev) => prev || profile.email || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError('Indica tu nombre y tu correo electrónico.');
      return;
    }

    setSubmitting(true);
    try {
      const content = {
        full_name: fullName.trim(),
        email: email.trim(),
        order_reference: orderReference.trim() || null,
        message: message.trim() || null,
        submitted_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('withdrawal_requests')
        // @ts-expect-error - el tipado generado no incluye aún esta tabla
        .insert({
          user_id: user?.id ?? null,
          full_name: content.full_name,
          email: content.email,
          order_reference: content.order_reference,
          message: content.message,
          content_snapshot: content,
        })
        .select('id, acknowledged_at')
        .single();

      if (insertError) throw insertError;

      const row = data as unknown as { id: string; acknowledged_at: string };
      setAck({
        reference: row.id,
        acknowledgedAt: row.acknowledged_at,
        fullName: content.full_name,
        email: content.email,
        orderReference: content.order_reference ?? '—',
        message: content.message ?? '—',
      });
    } catch (err) {
      console.error('Error al registrar el desistimiento:', err);
      setError(
        'No hemos podido registrar tu solicitud. Inténtalo de nuevo o escríbenos a ' +
          COMPANY.email
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Acuse de recibo ----------------
  if (ack) {
    const dt = new Date(ack.acknowledgedAt);
    return (
      <div className="bg-bg min-h-screen transition-colors">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-success-soft rounded-full">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
              </div>
              <CardTitle className="text-2xl">Hemos recibido tu desistimiento</CardTitle>
              <CardDescription>
                Este es tu acuse de recibo. Te recomendamos guardarlo o imprimirlo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[8px] border border-ds-border p-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Fecha y hora</span>
                  <span className="text-ds-text font-medium text-right">
                    {dt.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {dt.toLocaleTimeString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Referencia</span>
                  <span className="text-ds-text font-mono text-xs text-right break-all">
                    {ack.reference}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Nombre</span>
                  <span className="text-ds-text font-medium text-right">{ack.fullName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Email</span>
                  <span className="text-ds-text font-medium text-right break-all">
                    {ack.email}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Pedido</span>
                  <span className="text-ds-text font-medium text-right">
                    {ack.orderReference}
                  </span>
                </div>
                {ack.message !== '—' && (
                  <div className="pt-2 border-t border-ds-border">
                    <span className="text-muted block mb-1">Mensaje</span>
                    <span className="text-ds-text">{ack.message}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted space-y-2">
                <p>
                  Tu solicitud ha quedado registrada con la fecha y hora
                  indicadas. Nos pondremos en contacto contigo en el correo
                  facilitado para completar el proceso.
                </p>
                <p>
                  El reembolso, si procede, lo tramita Lemon Squeezy como
                  vendedor, por el mismo medio de pago que utilizaste.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.print()} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir o guardar
                </Button>
                <Link to="/">
                  <Button variant="ghost">Volver al inicio</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------- Formulario ----------------
  return (
    <div className="bg-bg min-h-screen transition-colors">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ds-text mb-3">
            Desistir del contrato
          </h1>
          <p className="text-muted leading-relaxed">
            Como consumidor tienes derecho a desistir del contrato en un plazo de
            14 días naturales desde su celebración, sin justificar tu decisión y
            sin penalización. Rellena este formulario y recibirás un acuse de
            recibo inmediato.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de desistimiento</CardTitle>
            <CardDescription>
              Solo necesitamos estos datos para identificar tu contrato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre y apellidos *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="el email con el que contrataste"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderReference">Referencia del pedido</Label>
                <Input
                  id="orderReference"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="Opcional: nº de pedido o fecha de contratación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Comentario</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Opcional"
                  className="flex w-full rounded-[8px] border border-ds-border bg-transparent px-3 py-2 text-sm text-ds-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>

              {error && (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Confirmar desistimiento'
                )}
              </Button>

              <p className="text-xs text-muted">
                Al confirmar, registraremos tu solicitud con la fecha y hora
                exactas y te mostraremos el acuse de recibo. También puedes
                comunicárnoslo por email a{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
                  {COMPANY.email}
                </a>
                .
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-muted mt-6">
          Si lo que quieres es dejar de pagar sin más, también puedes{' '}
          <Link to="/profile" className="text-primary hover:underline">
            cancelar tu suscripción desde tu perfil
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
