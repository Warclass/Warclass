'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PlayerLayout from '@/app/layouts/PlayerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/auth/useAuth';

interface PlayerDashboardProps {}

export default function PlayerDashboardPage({}: PlayerDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Si hay courseId, redirigir directamente a character
        if (courseId) {
          router.push(`/main/dashboard/player/character?courseId=${courseId}`);
          return;
        }

        // Si no hay courseId, verificar si tiene personaje
        const characterResponse = await fetch('/api/characters?action=check', {
          headers: {
            'x-user-id': user.id
          }
        });

        if (characterResponse.ok) {
          const characterData = await characterResponse.json();
          
          if (!characterData.hasCharacter) {
            // Si no tiene personaje, redirigir a crear personaje
            router.push('/main/dashboard/player/create-character');
            return;
          }

          setCharacter(characterData);
        }
      } catch (error) {
        console.error('Error al cargar datos del jugador:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [user?.id, courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
          <p className="mt-4 text-neutral-400 text-lg">Cargando tu aventura...</p>
        </div>
      </div>
    );
  }

  return (
    <PlayerLayout name={user?.name || 'Jugador'} token="temp-token">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Card con info del curso */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              {courseData ? courseData.name : '¡Bienvenido de vuelta!'}
            </CardTitle>
            <CardDescription className="text-xl text-white/90">
              {courseData 
                ? `${courseData.description || 'Continúa tu aventura en este curso'}`
                : 'Selecciona un curso para comenzar tu aventura'
              }
            </CardDescription>
          </CardHeader>
          
          {character && courseData?.character && (
            <CardContent>
              <div className="flex gap-6">
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{courseData.character.experience || 0}</div>
                    <div className="text-sm opacity-80">Experiencia</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{courseData.character.gold || 0}</div>
                    <div className="text-sm opacity-80">Oro</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{courseData.character.energy || 100}</div>
                    <div className="text-sm opacity-80">Energía</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/20 border-none text-white">
                  <CardContent className="p-4">
                    <div className="text-sm opacity-80">Personaje</div>
                    <div className="text-lg font-bold">{courseData.character.name}</div>
                    <div className="text-xs opacity-70">{courseData.character.className}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              const url = courseId 
                ? `/main/dashboard/player/character?courseId=${courseId}`
                : `/main/dashboard/player/character`;
              router.push(url);
            }}
          >
            <CardContent className="pt-6">
              <div className="text-blue-600 text-3xl mb-4">🧙‍♂️</div>
              <CardTitle className="text-xl mb-2">Mi Personaje</CardTitle>
              <CardDescription>
                Ver y personalizar tu personaje
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              const url = courseId 
                ? `/main/dashboard/player/quizzes?courseId=${courseId}`
                : `/main/dashboard/player/quizzes`;
              router.push(url);
            }}
          >
            <CardContent className="pt-6">
              <div className="text-green-600 text-3xl mb-4">🎯</div>
              <CardTitle className="text-xl mb-2">Exámenes</CardTitle>
              <CardDescription>
                Demuestra tu conocimiento en misiones épicas
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              const url = courseId 
                ? `/main/dashboard/player/tasks?courseId=${courseId}`
                : `/main/dashboard/player/tasks`;
              router.push(url);
            }}
          >
            <CardContent className="pt-6">
              <div className="text-purple-600 text-3xl mb-4">📚</div>
              <CardTitle className="text-xl mb-2">Tareas</CardTitle>
              <CardDescription>
                Completa misiones y gana recompensas
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Course Info */}
        {courseData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Información del Curso</CardTitle>
              <CardDescription>
                Detalles sobre tu curso actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Profesor</p>
                  <p className="text-neutral-100 font-medium">{courseData.teacher}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Código del Curso</p>
                  <p className="text-neutral-100 font-medium">{courseData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Total de Miembros</p>
                  <p className="text-neutral-100 font-medium">{courseData.membersCount} estudiantes</p>
                </div>
                {courseData.character && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Tu Personaje</p>
                    <p className="text-neutral-100 font-medium">
                      {courseData.character.name} - {courseData.character.className}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrolled Courses List */}
        {!courseData ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <CardTitle className="text-xl mb-2">No has seleccionado un curso</CardTitle>
              <CardDescription className="mb-4">
                Ve a tu dashboard principal y selecciona un curso para comenzar
              </CardDescription>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-[#D89216] hover:bg-[#b6770f] text-black"
              >
                Ir al Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Guild Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/main/dashboard/player/members')}
          >
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>👥</span>
                Mi Gremio
              </CardTitle>
              <CardDescription>
                Conoce a tus compañeros de aventura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400">
                Ve el ranking y colabora con otros jugadores
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/main/dashboard/player/score')}
          >
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>🏆</span>
                Mi Puntuación
              </CardTitle>
              <CardDescription>
                Revisa tu progreso y logros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400">
                Ve tu ranking y estadísticas detalladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <CardTitle className="text-base mb-1">Consejos para tu aventura</CardTitle>
                <CardDescription className="text-sm">
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Completa tareas diarias para ganar experiencia</li>
                    <li>Los exámenes te dan más oro y experiencia</li>
                    <li>Colabora con tu gremio para obtener bonificaciones</li>
                    <li>Revisa tu personaje para ver tus habilidades</li>
                    <li>¡Sube de nivel y desbloquea nuevas habilidades!</li>
                  </ol>
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}
