'use client';

import React, { useEffect, useState } from 'react';
import PlayerLayout from '@/app/layouts/PlayerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthContext } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

interface ActivityItem {
  id: string;
  course: string;
  description: string;
  time: string;
}

interface DashboardStats {
  enrolledCourses: number;
  teachingCourses: number;
  totalStudents: number;
  averageLevel: number;
}

export default function DashboardPage() {
  const { user, token } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    teachingCourses: 0,
    totalStudents: 0,
    averageLevel: 0
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch dashboard core data
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token || !user?.id) return;
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data.stats);
          setActivity(data.data.recentActivity);
        }
      } catch (e) {
        console.error('Error cargando dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token, user?.id]);

  // Fetch unread notifications count (API implementada por separado)
  useEffect(() => {
    const fetchUnread = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/notifications/unread-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setUnreadNotifications(json.count || 0);
        }
      } catch (e) {
        console.error('Error cargando notificaciones:', e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <PlayerLayout name="Panel de Control" token={token || ''}>
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white relative overflow-hidden">
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-4xl font-bold">
                  {loading ? 'Cargando…' : `¡Bienvenido, ${user?.name || 'Profesor'}!`}
                </CardTitle>
                <CardDescription className="text-xl text-white/90 mt-2">
                  Transforma tu enseñanza con gamificación
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <button
                  aria-label="Notificaciones"
                  className="relative"
                  onClick={() => {
                    setUnreadNotifications(0); // limpiar visualmente al ir a la vista
                    window.location.href = '/dashboard/invitations';
                  }}
                >
                  <Bell className="h-8 w-8 text-white/90" />
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 py-0 h-5 min-w-[20px] flex items-center justify-center">
                      {unreadNotifications}
                    </Badge>
                  )}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-md p-4">
                <p className="text-sm opacity-80">Cursos Activos</p>
                <p className="text-2xl font-bold">{stats.enrolledCourses}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-md p-4">
                <p className="text-sm opacity-80">Enseñando</p>
                <p className="text-2xl font-bold">{stats.teachingCourses}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-md p-4">
                <p className="text-sm opacity-80">Estudiantes</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-md p-4">
                <p className="text-sm opacity-80">Nivel Promedio</p>
                <p className="text-2xl font-bold">{stats.averageLevel}</p>
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-indigo-600/40 pointer-events-none" />
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-neutral-800 bg-[#151515]">
          <CardHeader>
            <CardTitle className="text-2xl text-neutral-100">Actividad Reciente</CardTitle>
            <CardDescription className="text-neutral-400">Últimos movimientos relacionados a tus cursos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-neutral-500">Cargando actividad...</div>
            ) : activity.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No hay actividad reciente</div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {activity.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-neutral-800 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-neutral-200">{item.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">{item.course} • {item.time}</p>
                      </div>
                      <Badge variant="outline" className="border-[#D89216] text-[#D89216]">{item.course}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}