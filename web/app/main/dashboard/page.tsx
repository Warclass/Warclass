'use client';

import React from 'react';
import PlayerLayout from '@/app/layouts/PlayerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { withAuth } from '@/lib/hoc/withAuth';
import { useAuthContext } from '@/contexts/AuthContext';

interface DashboardProps {
  teacher?: {
    name: string;
    courses: number;
    students: number;
  };
  institutionCourses?: Array<{
    id: string;
    name: string;
    description: string;
    students_count: number;
  }>;
  inscriptions?: Array<{
    id: string;
    course_name: string;
    status: string;
  }>;
  teachersCourses?: Array<{
    id: string;
    name: string;
    students_count: number;
  }>;
}

function DashboardPage({
  teacher,
  institutionCourses = [],
  inscriptions = [],
  teachersCourses = []
}: DashboardProps = {}) {
  return (
    <PlayerLayout name="Panel de Control" token="temp-token">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              ¡Bienvenido{teacher ? `, ${teacher.name}` : ''}!
            </CardTitle>
            <CardDescription className="text-xl text-white/90">
              Transforma tu enseñanza con gamificación
            </CardDescription>
          </CardHeader>
          
          {teacher && (
            <CardContent>
              <div className="flex gap-6">
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{teacher.courses}</div>
                    <div className="text-sm opacity-80">Cursos</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{teacher.students}</div>
                    <div className="text-sm opacity-80">Estudiantes</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-blue-600 text-3xl mb-4">🎯</div>
              <CardTitle className="text-xl mb-2">Crear Misión</CardTitle>
              <CardDescription>
                Diseña nuevas aventuras de aprendizaje
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-green-600 text-3xl mb-4">👥</div>
              <CardTitle className="text-xl mb-2">Gestionar Grupos</CardTitle>
              <CardDescription>
                Organiza a tus estudiantes en equipos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-purple-600 text-3xl mb-4">📊</div>
              <CardTitle className="text-xl mb-2">Ver Estadísticas</CardTitle>
              <CardDescription>
                Analiza el progreso de tus estudiantes
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {(institutionCourses.length > 0 || teachersCourses.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {institutionCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Cursos de la Institución</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {institutionCourses.slice(0, 5).map((course) => (
                        <Card 
                          key={course.id}
                          className="hover:bg-accent transition-colors cursor-pointer"
                        >
                          <CardContent className="pt-6">
                            <CardTitle className="text-base mb-2">{course.name}</CardTitle>
                            <CardDescription className="text-sm mb-2">
                              {course.description}
                            </CardDescription>
                            <Badge variant="secondary" className="text-xs">
                              {course.students_count} estudiantes
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {teachersCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Mis Cursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {teachersCourses.slice(0, 5).map((course) => (
                        <Card 
                          key={course.id}
                          className="hover:bg-accent transition-colors cursor-pointer"
                        >
                          <CardContent className="pt-6">
                            <CardTitle className="text-base mb-2">{course.name}</CardTitle>
                            <Badge variant="default" className="text-xs">
                              {course.students_count} estudiantes inscritos
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {inscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {inscriptions.slice(0, 5).map((inscription) => (
                    <div 
                      key={inscription.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{inscription.course_name}</div>
                        <CardDescription className="text-sm">
                          Inscripción: {inscription.status}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={inscription.status === 'active' ? 'default' : 'secondary'}
                      >
                        {inscription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  );
}

export default withAuth(DashboardPage);