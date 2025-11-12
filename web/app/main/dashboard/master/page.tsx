'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourseData } from '@/hooks/useCourseData';
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
  const { user, token } = useAuth();
  const courseId = searchParams.get('courseId');
  
  // Hook para obtener el nombre del curso
  const { courseData: courseInfo } = useCourseData(courseId);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CourseStats>({
    totalStudents: 0,
    totalGroups: 0,
    activeTasks: 0,
    activeQuizzes: 0,
    averageProgress: 0
  });
  const [courseData, setCourseData] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      if (!user?.id || !token) return;

      try {
        setLoading(true);

        // Obtener información del curso
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (courseResponse.ok) {
          const courseDataResponse = await courseResponse.json();
          setCourseData(courseDataResponse.course);
        }

        // Obtener todos los personajes del curso
        const charactersResponse = await fetch(
          `/api/characters?action=listByCourse&courseId=${courseId}`, 
          {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json();
          const allCharacters = charactersData.data || [];
          setCharacters(allCharacters);
          
          setStats(prev => ({
            ...prev,
            totalStudents: allCharacters.length
          }));
        }

        // Obtener grupos del curso
        const groupsResponse = await fetch(`/api/groups?courseId=${courseId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
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
          headers: { 
            'Authorization': `Bearer ${token}`
          }
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
          headers: { 
            'Authorization': `Bearer ${token}`
          }
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
  }, [courseId, user?.id, token, router]);

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId} courseName={courseInfo?.name}>
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
    <MasterCourseLayout courseId={courseId} courseName={courseInfo?.name}>
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

        {/* Personajes del Curso */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#D89216]" />
              Personajes del Curso
              <Badge variant="secondary" className="ml-2">
                {characters.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Estudiantes que han creado sus personajes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {characters.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aún no hay personajes creados en este curso</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character: any) => (
                  <Card 
                    key={character.id} 
                    className="bg-[#0f0f0f] border-neutral-700 hover:border-[#D89216] transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-neutral-100">
                            {character.name}
                          </CardTitle>
                          <p className="text-sm text-neutral-400 mt-1">
                            {character.user.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {character.user.email}
                          </p>
                        </div>
                        <Badge 
                          variant={character.hasGroup ? "default" : "secondary"}
                          className={character.hasGroup ? "bg-green-600" : "bg-neutral-600"}
                        >
                          {character.hasGroup ? "Con Grupo" : "Sin Grupo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Clase */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Clase:</span>
                        <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                          {character.class.name}
                        </Badge>
                      </div>

                      {/* Grupo */}
                      {character.group && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-400">Grupo:</span>
                          <span className="text-sm text-neutral-100">
                            {character.group.name}
                          </span>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-700">
                        <div>
                          <p className="text-xs text-neutral-500">Experiencia</p>
                          <p className="text-sm font-semibold text-neutral-100">
                            {character.experience} XP
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Oro</p>
                          <p className="text-sm font-semibold text-[#D89216]">
                            {character.gold}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Energía</p>
                          <p className="text-sm font-semibold text-blue-400">
                            {character.energy}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Salud</p>
                          <p className="text-sm font-semibold text-green-400">
                            {character.health}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
