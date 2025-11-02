"use client";

import React from "react";
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
  LogOut
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth/useAuth";

// Tipos
interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  students: number;
  quests: number;
  level: number;
  image?: string;
}

interface EnrolledCourse {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  color: string;
  nextQuest?: string;
  level: number;
  image?: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Datos de ejemplo - En producción vendrían de una API
  const teachingCourses: Course[] = [
    {
      id: "1",
      name: "Programación Web",
      code: "CS-101",
      color: "bg-blue-500",
      students: 32,
      quests: 12,
      level: 3,
      image: "/img/courses/web.jpg"
    },
    {
      id: "2",
      name: "Base de Datos",
      code: "CS-201",
      color: "bg-green-500",
      students: 28,
      quests: 8,
      level: 2,
      image: "/img/courses/db.jpg"
    },
    {
      id: "3",
      name: "Algoritmos",
      code: "CS-301",
      color: "bg-purple-500",
      students: 25,
      quests: 15,
      level: 4,
      image: "/img/courses/algo.jpg"
    }
  ];

  const enrolledCourses: EnrolledCourse[] = [
    {
      id: "4",
      name: "Inteligencia Artificial",
      instructor: "Dr. García",
      progress: 65,
      color: "bg-red-500",
      nextQuest: "Redes Neuronales",
      level: 12,
      image: "/img/courses/ai.jpg"
    },
    {
      id: "5",
      name: "Matemáticas Discretas",
      instructor: "Prof. Martínez",
      progress: 40,
      color: "bg-yellow-500",
      nextQuest: "Teoría de Grafos",
      level: 8,
      image: "/img/courses/math.jpg"
    }
  ];

  const recentActivity = [
    {
      id: "1",
      type: "quest_completed",
      course: "Programación Web",
      description: "Juan Pérez completó 'Diseño Responsivo'",
      time: "Hace 2 horas",
      avatar: "/img/user01.jpeg"
    },
    {
      id: "2",
      type: "new_submission",
      course: "Base de Datos",
      description: "5 nuevas entregas en 'Normalización'",
      time: "Hace 3 horas",
      avatar: "/img/user02.jpg"
    },
    {
      id: "3",
      type: "level_up",
      course: "Inteligencia Artificial",
      description: "¡Subiste al nivel 13!",
      time: "Hace 5 horas",
      avatar: user?.name || ""
    }
  ];

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
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-neutral-100"
            >
              <Settings className="h-5 w-5" />
            </Button>

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
                {enrolledCourses.length}
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
                {teachingCourses.length}
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
                {teachingCourses.reduce((acc, c) => acc + c.students, 0)}
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
                {Math.round(
                  enrolledCourses.reduce((acc, c) => acc + c.level, 0) /
                    enrolledCourses.length
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="enrolled" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-neutral-800">
                <TabsTrigger 
                  value="enrolled"
                  className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
                >
                  Mis Cursos
                </TabsTrigger>
                <TabsTrigger 
                  value="teaching"
                  className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
                >
                  Enseñando
                </TabsTrigger>
              </TabsList>

              {/* Enrolled Courses Tab */}
              <TabsContent value="enrolled" className="space-y-4 mt-6">
                {enrolledCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}
                          >
                            {course.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-neutral-100">
                              {course.name}
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                              {course.instructor}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-[#D89216] text-[#D89216]"
                        >
                          Nivel {course.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-neutral-400">
                            <span>Progreso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#D89216] to-[#f0a726] transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {course.nextQuest && (
                          <div className="flex items-center gap-2 text-sm text-neutral-300 pt-2">
                            <Target className="h-4 w-4 text-[#D89216]" />
                            <span>Próxima misión: {course.nextQuest}</span>
                          </div>
                        )}

                        <Link href={`/dashboard/player/groups`}>
                          <Button className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold">
                            Continuar Aventura
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Teaching Courses Tab */}
              <TabsContent value="teaching" className="space-y-4 mt-6">
                <Card className="bg-[#1a1a1a] border-neutral-800 border-dashed hover:border-[#D89216] transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Plus className="h-12 w-12 text-neutral-600 mb-2" />
                    <p className="text-neutral-400 text-sm">Crear nuevo curso</p>
                  </CardContent>
                </Card>

                {teachingCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}
                          >
                            {course.code}
                          </div>
                          <div>
                            <CardTitle className="text-neutral-100">
                              {course.name}
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                              Código: {course.code}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-blue-500 text-blue-400"
                        >
                          Nivel {course.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-4 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students} estudiantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {course.quests} misiones
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/master/groups`}>
                        <Button
                          variant="outline"
                          className="w-full border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                        >
                          Gestionar Curso
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
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
    </div>
  );
}
