"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Trophy, 
  Target,
  Plus,
  Settings,
  Bell,
  Search,
  LogOut,
  Mail,
  UserCircle,
  Send
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { CreateCourseModal } from "@/components/dashboard/CreateCourseModal";
import { InvitationModal } from "@/components/dashboard/InvitationModal";

interface TeacherCourse {
  id: string;
  name: string;
  description: string | null;
  studentsCount: number;
  groupsCount: number;
  membersCount: number;
  institutionId?: string | null;
  institutionName?: string | null;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useDashboard();
  
  // Estados para invitaciones y personaje
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [myInscriptions, setMyInscriptions] = useState<any[]>([]);

  // Estados para profesor
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  // Estados para modales
  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null);

  // Usar datos del API o valores por defecto
  const enrolledCourses = dashboardData?.enrolledCourses || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const stats = dashboardData?.stats || {
    enrolledCourses: 0,
    teachingCourses: 0,
    totalStudents: 0,
    averageLevel: 0,
  };

  // Cargar invitaciones y estado del personaje
  useEffect(() => {
    const fetchInvitationsAndCharacter = async () => {
      if (!user?.id) return;

      try {
        setLoadingInvitations(true);

        // Obtener conteo de invitaciones
        const invitationsResponse = await fetch('/api/invitations/count', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (invitationsResponse.ok) {
          const invitationsData = await invitationsResponse.json();
          setPendingInvitations(invitationsData.count || 0);
        }

        // Verificar si tiene personaje
        const characterResponse = await fetch('/api/characters?action=check', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (characterResponse.ok) {
          const characterData = await characterResponse.json();
          setHasCharacter(characterData.hasCharacter);
        }

        // Obtener cursos inscritos
        const inscriptionsResponse = await fetch('/api/inscriptions', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (inscriptionsResponse.ok) {
          const inscriptionsData = await inscriptionsResponse.json();
          setMyInscriptions(inscriptionsData.data || []);
        }
      } catch (error) {
        console.error('Error al cargar invitaciones y personaje:', error);
      } finally {
        setLoadingInvitations(false);
      }
    };

    fetchInvitationsAndCharacter();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchInvitationsAndCharacter, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Verificar si es profesor y cargar sus cursos
  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (!user?.id) return;

      try {
        setLoadingTeacher(true);

        // Verificar si es profesor
        const teacherResponse = await fetch('/api/teachers/check', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          setIsTeacher(teacherData.isTeacher);

          // Si es profesor, cargar sus cursos
          if (teacherData.isTeacher) {
            const coursesResponse = await fetch('/api/courses/teacher', {
              headers: {
                'x-user-id': user.id
              }
            });

            if (coursesResponse.ok) {
              const coursesData = await coursesResponse.json();
              setTeacherCourses(coursesData.courses || []);
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar estado de profesor:', error);
      } finally {
        setLoadingTeacher(false);
      }
    };

    checkTeacherStatus();
  }, [user?.id]);

  const refreshTeacherCourses = async () => {
    if (!user?.id || !isTeacher) return;

    try {
      const coursesResponse = await fetch('/api/courses/teacher', {
        headers: {
          'x-user-id': user.id
        }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setTeacherCourses(coursesData.courses || []);
      }
    } catch (error) {
      console.error('Error al refrescar cursos:', error);
    }
  };

  const handleOpenInvitationModal = (courseId: string, courseName: string) => {
    setSelectedCourse({ id: courseId, name: courseName });
    setInvitationModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
          <p className="mt-4 text-neutral-400 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Card className="bg-[#1a1a1a] border-red-800 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Error al cargar dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/80">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-[#D89216]" />
            <span className="hidden sm:inline text-sm font-bold tracking-widest text-neutral-100">
              WARCLASS
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder="Buscar cursos, misiones..."
                className="pl-9 bg-[#1a1a1a] border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-neutral-100"
              onClick={() => router.push('/dashboard/invitations')}
            >
              <Bell className="h-5 w-5" />
              {pendingInvitations > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs px-1"
                >
                  {pendingInvitations}
                </Badge>
              )}
            </Button>
            <Link href="/dashboard/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-400 hover:text-neutral-100"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border-2 border-[#D89216]">
                <AvatarImage src="/img/default-avatar.jpg" alt={user?.name} />
                <AvatarFallback className="bg-[#D89216] text-black text-xs font-bold">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex text-neutral-400 hover:text-neutral-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            ¡Bienvenido de vuelta, {user?.name || "Aventurero"}!
          </h1>
          <p className="text-neutral-400">
            Continúa tu viaje de aprendizaje o gestiona tus cursos
          </p>
        </div>

        {/* Alertas - Invitaciones y Personaje */}
        {(pendingInvitations > 0 || !hasCharacter) && (
          <div className="space-y-4 mb-8">
            {pendingInvitations > 0 && (
              <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-yellow-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Mail className="h-6 w-6 text-yellow-500 mt-1" />
                      <div>
                        <CardTitle className="text-lg mb-1 text-neutral-100">
                          Tienes {pendingInvitations} invitación{pendingInvitations !== 1 ? 'es' : ''} pendiente{pendingInvitations !== 1 ? 's' : ''}
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                          Revisa tus invitaciones para unirte a nuevos cursos
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/dashboard/invitations')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-black"
                    >
                      Ver Invitaciones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!hasCharacter && !loadingInvitations && (
              <Card className="bg-gradient-to-r from-green-900/20 to-green-800/10 border-green-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <UserCircle className="h-6 w-6 text-green-500 mt-1" />
                      <div>
                        <CardTitle className="text-lg mb-1 text-neutral-100">
                          ¡Crea tu personaje!
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                          Antes de comenzar tu aventura, necesitas crear tu personaje
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/dashboard/create-character')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Crear Personaje
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Cursos Activos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.enrolledCourses}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Enseñando
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.teachingCourses}
              </div>
            </CardContent>
          </Card>

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
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Nivel Promedio
              </CardTitle>
              <Trophy className="h-4 w-4 text-[#D89216]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {stats.averageLevel || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="enrolled" className="w-full">
              <TabsList className={`grid w-full ${isTeacher ? 'grid-cols-2' : 'grid-cols-1'} bg-[#1a1a1a] border border-neutral-800`}>
                <TabsTrigger 
                  value="enrolled"
                  className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
                >
                  Mis Cursos
                </TabsTrigger>
                {isTeacher && (
                  <TabsTrigger 
                    value="teaching"
                    className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
                  >
                    Enseñando
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Enrolled Courses Tab */}
              <TabsContent value="enrolled" className="space-y-4 mt-6">
                {myInscriptions.length === 0 ? (
                  <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-16 w-16 text-neutral-600 mb-4" />
                      <p className="text-neutral-400 text-center mb-2">
                        No estás inscrito en ningún curso
                      </p>
                      <p className="text-neutral-500 text-sm text-center">
                        Acepta invitaciones para unirte a cursos
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  myInscriptions.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                    onClick={() => router.push(`/main/dashboard/player?courseId=${course.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          >
                            {course.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-neutral-100">
                              {course.name}
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                              Profesor: {course.teacher}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-[#D89216] text-[#D89216]"
                        >
                          {course.membersCount} miembros
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-400">
                          {course.description || 'Sin descripción'}
                        </p>

                        {course.hasCharacter && course.character && (
                          <div className="flex items-center gap-2 text-sm text-neutral-300 pt-2">
                            <Target className="h-4 w-4 text-[#D89216]" />
                            <span>Personaje: {course.character.name} ({course.character.className})</span>
                          </div>
                        )}

                        <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold">
                          {course.hasCharacter ? 'Continuar Aventura' : 'Crear Personaje'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </TabsContent>

              {/* Teaching Courses Tab */}
              {isTeacher && (
                <TabsContent value="teaching" className="space-y-4 mt-6">
                  {loadingTeacher ? (
                    <Card className="bg-[#1a1a1a] border-neutral-800">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D89216] mb-4"></div>
                        <p className="text-neutral-400">Cargando cursos...</p>
                      </CardContent>
                    </Card>
                  ) : teacherCourses.length === 0 ? (
                    <Card className="bg-[#1a1a1a] border-neutral-800">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <GraduationCap className="h-16 w-16 text-neutral-600 mb-4" />
                        <p className="text-neutral-400 text-center mb-2">
                          No estás enseñando ningún curso
                        </p>
                        <p className="text-neutral-500 text-sm text-center mb-4">
                          Crea tu primer curso para comenzar a enseñar
                        </p>
                        <Button 
                          className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                          onClick={() => setCreateCourseModalOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Curso
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          className="border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                          onClick={() => router.push('/dashboard/invitations/teacher')}
                        >
                          Ver estado de invitaciones
                        </Button>
                      </div>
                      <Card 
                        className="bg-[#1a1a1a] border-neutral-800 border-dashed hover:border-[#D89216] transition-colors cursor-pointer"
                        onClick={() => setCreateCourseModalOpen(true)}
                      >
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <Plus className="h-12 w-12 text-neutral-600 mb-2" />
                          <p className="text-neutral-400 text-sm">Crear nuevo curso</p>
                        </CardContent>
                      </Card>

                      {teacherCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                  {course.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-neutral-100">
                                    {course.name}
                                  </CardTitle>
                                  <CardDescription className="text-neutral-500">
                                    {course.description || 'Sin descripción'}
                                  </CardDescription>
                                  {course.institutionName && (
                                    <div className="text-xs text-neutral-500 mt-1">
                                      Institución: {course.institutionName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-blue-500 text-blue-400"
                              >
                                {course.studentsCount} estudiantes
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-4 text-sm text-neutral-400 mb-4">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {course.groupsCount} grupos
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {course.membersCount} miembros
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                                onClick={() => router.push(`/main/dashboard/master?courseId=${course.id}`)}
                              >
                                Gestionar Curso
                              </Button>
                              <Button
                                className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInvitationModal(course.id, course.name);
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Invitar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-100 text-lg">
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 pb-4 border-b border-neutral-800 last:border-0 last:pb-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="bg-[#D89216] text-black text-xs">
                        {activity.course.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-neutral-300">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{activity.course}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-100 text-lg">
                  Accesos Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/player/character">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Mi Personaje
                  </Button>
                </Link>
                <Link href="/dashboard/player/groups">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Mis Grupos
                  </Button>
                </Link>
                <Link href="/dashboard/master/groups">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Crear Misión
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modales */}
      {user?.id && (
        <>
          <CreateCourseModal
            open={createCourseModalOpen}
            onOpenChange={setCreateCourseModalOpen}
            onSuccess={refreshTeacherCourses}
            userId={user.id}
          />
          {selectedCourse && (
            <InvitationModal
              open={invitationModalOpen}
              onOpenChange={setInvitationModalOpen}
              courseId={selectedCourse.id}
              courseName={selectedCourse.name}
              userId={user.id}
            />
          )}
        </>
      )}
    </div>
  );
}
