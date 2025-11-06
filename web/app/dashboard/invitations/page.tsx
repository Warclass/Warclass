'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import Link from 'next/link';

interface Invitation {
  id: string;
  code: string;
  courseName: string;
  courseDescription: string | null;
  createdAt: Date;
  used: boolean;
}

export default function InvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchInvitations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/invitations', {
        headers: {
          'x-user-id': user.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar invitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id]);

  const handleAccept = async (invitationId: string) => {
    if (!user?.id) return;

    try {
      setProcessingId(invitationId);
      
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id
        }
      });

      if (response.ok) {
        // Recargar invitaciones y volver al dashboard
        await fetchInvitations();
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Error al aceptar invitación');
      }
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      alert('Error al aceptar invitación');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    if (!user?.id) return;

    try {
      setProcessingId(invitationId);
      
      const response = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id
        }
      });

      if (response.ok) {
        await fetchInvitations();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al rechazar invitación');
      }
    } catch (error) {
      console.error('Error al rechazar invitación:', error);
      alert('Error al rechazar invitación');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-neutral-400" />
              <span className="text-neutral-100">Volver al Dashboard</span>
            </Link>
          </div>
        </header>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#D89216]" />
            <span className="text-neutral-100 font-semibold">Invitaciones</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
              <Mail className="h-8 w-8 text-[#D89216]" />
              Mis Invitaciones
            </CardTitle>
            <CardDescription className="text-neutral-400 text-lg">
              {invitations.filter(i => !i.used).length} pendiente{invitations.filter(i => !i.used).length !== 1 ? 's' : ''} • {invitations.filter(i => i.used).length} aceptada{invitations.filter(i => i.used).length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
        </Card>

        {invitations.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="pt-6 text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <CardTitle className="text-xl mb-2 text-neutral-100">No tienes invitaciones</CardTitle>
              <CardDescription className="text-neutral-400">
                Cuando recibas invitaciones a cursos, aparecerán aquí
              </CardDescription>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="mt-6 bg-[#D89216] hover:bg-[#b6770f] text-black"
              >
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card 
                  key={invitation.id}
                  className={`transition-colors ${
                    invitation.used
                      ? 'bg-green-950/20 border-green-800/50 opacity-75'
                      : 'bg-[#1a1a1a] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-neutral-100 flex items-center gap-2">
                          {invitation.courseName}
                          {invitation.used && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-base text-neutral-400">
                          {invitation.courseDescription || 'Sin descripción'}
                        </CardDescription>
                      </div>
                      {invitation.used ? (
                        <Badge className="ml-4 bg-green-900/50 text-green-400 border-green-700/50">
                          ✓ Aceptada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-4 bg-yellow-900/30 text-yellow-500 border-yellow-700/50">
                          📧 Pendiente
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <span>Código:</span>
                      <code className={`px-3 py-1 rounded font-mono border ${
                        invitation.used
                          ? 'bg-green-950/20 border-green-800/50 text-green-500'
                          : 'bg-[#0a0a0a] border-neutral-800 text-[#D89216]'
                      }`}>
                        {invitation.code}
                      </code>
                    </div>
                  </CardContent>

                  {!invitation.used && (
                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={() => handleAccept(invitation.id)}
                        disabled={processingId === invitation.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === invitation.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Aceptar Invitación
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(invitation.id)}
                        disabled={processingId === invitation.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <Card className="bg-blue-900/10 border-blue-700/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <CardTitle className="text-base mb-1 text-neutral-100">¿Qué sucede al aceptar?</CardTitle>
                <CardDescription className="text-sm text-neutral-400">
                  Al aceptar una invitación, serás inscrito al curso y podrás crear tu personaje para comenzar las aventuras de aprendizaje. Si ya tienes un personaje, podrás usar el mismo para este curso.
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
