'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail, Users, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface TeacherInvitation {
  id: string;
  name: string;
  code: string;
  used: boolean;
  createdAt: string;
  courseId: string;
  courseName: string;
  courseDescription: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

export default function TeacherInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await fetch('/api/invitations/teacher', {
          headers: { 'x-user-id': user.id }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error al cargar invitaciones');
        } else {
          setInvitations(data.data || []);
        }
      } catch (e) {
        setError('Error de red al cargar invitaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  // Agrupar por curso
  const grouped = invitations.reduce<Record<string, TeacherInvitation[]>>((acc, inv) => {
    acc[inv.courseId] = acc[inv.courseId] || [];
    acc[inv.courseId].push(inv);
    return acc;
  }, {});

  if (!user?.id) {
    return (
      <div className='min-h-screen flex items-center justify-center text-neutral-300'>
        Debes iniciar sesión.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#0a0a0a]'>
      <header className='sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur'>
        <div className='max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6'>
          <Link href='/dashboard' className='flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition'>
            <ArrowLeft className='h-5 w-5' />
            <span>Volver al Dashboard</span>
          </Link>
          <div className='flex items-center gap-2'>
            <Mail className='h-5 w-5 text-[#D89216]' />
            <span className='text-neutral-100 font-semibold'>Invitaciones de Mis Cursos</span>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8'>
        <Card className='bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700/50'>
          <CardHeader>
            <CardTitle className='text-3xl font-bold text-neutral-100'>Estado de Invitaciones</CardTitle>
            <CardDescription className='text-neutral-400'>Visualiza las invitaciones generadas para tus cursos y su estado.</CardDescription>
          </CardHeader>
        </Card>

        {loading && (
          <Card className='bg-[#1a1a1a] border-neutral-800'>
            <CardContent className='py-12 flex flex-col items-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#D89216] mb-4'></div>
              <p className='text-neutral-400'>Cargando invitaciones...</p>
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className='bg-red-950/30 border-red-800/50'>
            <CardContent className='py-6 text-red-300 text-sm'>{error}</CardContent>
          </Card>
        )}

        {!loading && !error && invitations.length === 0 && (
          <Card className='bg-[#1a1a1a] border-neutral-800'>
            <CardContent className='py-12 text-center space-y-2'>
              <p className='text-neutral-300 font-semibold'>No hay invitaciones creadas.</p>
              <p className='text-neutral-500 text-sm'>Genera invitaciones desde la pestaña "Enseñando" de un curso.</p>
              <Button asChild className='mt-4 bg-[#D89216] hover:bg-[#b6770f] text-black'>
                <Link href='/dashboard'>Ir al Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Listado por curso */}
        {!loading && !error && Object.entries(grouped).map(([courseId, courseInvs]) => {
          const courseName = courseInvs[0].courseName;
          const courseDescription = courseInvs[0].courseDescription;
          const total = courseInvs.length;
          const used = courseInvs.filter(i => i.used).length;
          const pending = total - used;
          return (
            <Card key={courseId} className='bg-[#1a1a1a] border-neutral-800'>
              <CardHeader className='space-y-2'>
                <CardTitle className='text-xl text-neutral-100 flex items-center justify-between'>
                  <span>{courseName}</span>
                  <Badge variant='outline' className='border-blue-500 text-blue-400'>{total} invitación{total !== 1 ? 'es' : ''}</Badge>
                </CardTitle>
                <CardDescription className='text-neutral-500'>{courseDescription || 'Sin descripción'}</CardDescription>
                <div className='flex gap-2 text-xs'>
                  <Badge className='bg-green-900/40 text-green-400'>{used} usada{used !== 1 ? 's' : ''}</Badge>
                  <Badge className='bg-yellow-900/40 text-yellow-400'>{pending} pendiente{pending !== 1 ? 's' : ''}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto rounded-md border border-neutral-800'>
                  <table className='w-full text-sm'>
                    <thead className='bg-neutral-900'>
                      <tr className='text-neutral-300'>
                        <th className='text-left font-medium px-3 py-2'>Código</th>
                        <th className='text-left font-medium px-3 py-2'>Nombre</th>
                        <th className='text-left font-medium px-3 py-2'>Destinatario</th>
                        <th className='text-left font-medium px-3 py-2'>Estado</th>
                        <th className='text-left font-medium px-3 py-2'>Creada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseInvs.map((inv) => (
                        <tr key={inv.id} className='border-t border-neutral-800 hover:bg-neutral-800/40'>
                          <td className='px-3 py-2 font-mono text-[#D89216]'>{inv.code}</td>
                          <td className='px-3 py-2 text-neutral-200'>{inv.name}</td>
                          <td className='px-3 py-2 text-neutral-400'>
                            {inv.userEmail ? (
                              <span className='flex items-center gap-1'>
                                <Eye className='h-3 w-3 text-neutral-500' /> {inv.userName} <span className='text-xs text-neutral-500'>({inv.userEmail})</span>
                              </span>
                            ) : (
                              <span className='italic text-neutral-600'>Genérica</span>
                            )}
                          </td>
                          <td className='px-3 py-2'>
                            {inv.used ? (
                              <Badge className='bg-green-900/40 text-green-400 flex items-center gap-1'><CheckCircle2 className='h-3 w-3' /> Usada</Badge>
                            ) : (
                              <Badge variant='secondary' className='bg-yellow-900/40 text-yellow-400 flex items-center gap-1'><XCircle className='h-3 w-3' /> Pendiente</Badge>
                            )}
                          </td>
                          <td className='px-3 py-2 text-neutral-500'>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
