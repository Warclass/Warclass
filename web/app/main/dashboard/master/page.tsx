'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import MasterCourseLayout from '@/app/layouts/MasterCourseLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UsersRound, 
  FileText, 
  ClipboardList,
  TrendingUp,
  Award
} from 'lucide-react';

interface CourseStats {
  totalStudents: number;
  totalGroups: number;
  activeTasks: number;
  activeQuizzes: number;
  averageProgress: number;
}

export default function MasterCourseDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const courseId = searchParams.get('courseId');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CourseStats>({
    totalStudents: 0,
    totalGroups: 0,
    activeTasks: 0,
    activeQuizzes: 0,
    averageProgress: 0
  });
  const [courseData, setCourseData] = useState<any>(null);

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Obtener información del curso
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: { 'x-user-id': user.id }
        });
        
        if (courseResponse.ok) {
          const courseDataResponse = await courseResponse.json();
          setCourseData(courseDataResponse.course);
        }

        // Obtener miembros del curso
        const membersResponse = await fetch(`/api/courses/members?courseId=${courseId}`, {
          headers: { 'x-user-id': user.id }
        });

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          const members = membersData.members || [];
          
          setStats(prev => ({
            ...prev,
            totalStudents: members.length
          }));
        }

        // Obtener grupos del curso
        const groupsResponse = await fetch(`/api/groups?courseId=${courseId}`, {
          headers: { 'x-user-id': user.id }
        });

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setStats(prev => ({
            ...prev,
            totalGroups: groupsData.data?.length || 0
          }));
        }

        // Obtener tareas del curso
        const tasksResponse = await fetch(`/api/tasks/course/${courseId}`, {
          headers: { 'x-user-id': user.id }
        });

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setStats(prev => ({
            ...prev,
            activeTasks: tasksData.tasks?.length || 0
          }));
        }

        // Obtener quizzes del curso
        const quizzesResponse = await fetch(`/api/quizzes/course/${courseId}`, {
          headers: { 'x-user-id': user.id }
        });

        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setStats(prev => ({
            ...prev,
            activeQuizzes: quizzesData.quizzes?.length || 0
          }));
        }

      } catch (error) {
        console.error('Error cargando dashboard del curso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [courseId, user?.id, router]);

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando datos del curso...</p>
          </div>
        </div>
      </MasterCourseLayout>
    );
  }

  return (
    <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            Panel de Gestión del Curso
          </h1>
          <p className="text-neutral-400">
            Administra grupos, miembros, tareas y evaluaciones
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Estudiantes
              </CardTitle>
              <Users className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.totalStudents}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Miembros activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Grupos
              </CardTitle>
              <UsersRound className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.totalGroups}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Grupos formados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Tareas
              </CardTitle>
              <FileText className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.activeTasks}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Tareas activas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Exámenes
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.activeQuizzes}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Exámenes disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                onClick={() => router.push(`/main/dashboard/master/groups?courseId=${courseId}`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-[#D89216]" />
                Gestionar Grupos
              </CardTitle>
              <CardDescription>
                Crea grupos y asigna estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black">
                Ver Grupos
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                onClick={() => router.push(`/main/dashboard/master/members?courseId=${courseId}`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D89216]" />
                Gestionar Miembros
              </CardTitle>
              <CardDescription>
                Visualiza y asigna experiencia/oro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black">
                Ver Miembros
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                onClick={() => router.push(`/main/dashboard/master/tasks?courseId=${courseId}`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D89216]" />
                Gestionar Tareas
              </CardTitle>
              <CardDescription>
                Crea y habilita tareas para los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black">
                Ver Tareas
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                onClick={() => router.push(`/main/dashboard/master/quizzes?courseId=${courseId}`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#D89216]" />
                Gestionar Exámenes
              </CardTitle>
              <CardDescription>
                Crea y habilita exámenes para el curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black">
                Ver Exámenes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#D89216]" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-neutral-500">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MasterCourseLayout>
  );
}
