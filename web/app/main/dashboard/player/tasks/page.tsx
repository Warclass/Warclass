"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCourseData } from "@/hooks/useCourseData";
import PlayerLayout from "@/app/layouts/PlayerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CheckCircle, Clock, Trophy, Coins } from "lucide-react";

interface Task {
  id: string;
  name: string;
  description: string | null;
  experience: number;
  gold: number;
  health: number;
  energy: number;
  completed?: boolean;
}

export default function TasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  const courseId = searchParams.get("courseId");
  
  // Obtener datos del curso para el nombre
  const { courseData } = useCourseData(courseId);

  useEffect(() => {
    if (!courseId || !user?.id) {
      setIsLoading(false);
      return;
    }

    // Obtener memberId y groupId del usuario en el curso
    const fetchMemberData = async () => {
      try {
        const response = await fetch(
          `/api/characters/member?userId=${user.id}&courseId=${courseId}`
        );

        if (response.ok) {
          const result = await response.json();
          const characterId = result?.data?.id;
          const grpId = result?.data?.groupId ?? null;
          if (characterId) setMemberId(characterId);
          if (grpId) setGroupId(grpId);
        } else {
          console.error('Error al obtener member:', response.status);
        }
      } catch (error) {
        console.error('Error al obtener member:', error);
      }
    };

    fetchMemberData();
  }, [courseId, user?.id]);

  useEffect(() => {
    // Fallback:
    // - Si hay groupId y characterId: obtener tareas con estado de completitud
    // - Si NO hay groupId pero sí courseId/characterId: obtener tareas del curso sin estado
    const load = async () => {
      if (!user?.id || !memberId || !courseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        if (groupId) {
          const response = await fetch(
            `/api/tasks?groupId=${groupId}&characterId=${memberId}`,
            {
              headers: {
                'x-user-id': user.id,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setTasks(data.tasks || []);
            return;
          }
        }

        // Sin groupId: traer tareas del curso como fallback
        const resCourse = await fetch(
          `/api/tasks/course/${courseId}`,
          {
            headers: {
              'x-user-id': user.id,
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          }
        );
        if (resCourse.ok) {
          const data = await resCourse.json();
          // Mapear a la interfaz local y setear completed=false (sin estado por personaje)
          const mapped: Task[] = (data.tasks || data.data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description ?? null,
            experience: t.experience ?? 0,
            gold: t.gold ?? 0,
            health: t.health ?? 0,
            energy: t.energy ?? 0,
            completed: false,
          }));
          setTasks(mapped);
        } else {
          console.error('Error al cargar tasks del curso:', resCourse.status);
        }
      } catch (error) {
        console.error('Error al cargar tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId, memberId, user?.id, token, courseId]);

  const completedCount = tasks.filter(t => t.completed).length;

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name} token="" courseId={courseId || undefined} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando tareas...</p>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  if (!courseId) {
    return (
      <PlayerLayout name={user?.name} token="" courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-neutral-400">No se especificó un curso</p>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout name={user?.name} token="" courseId={courseId || undefined} courseName={courseData?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100">Tareas</h1>
            <p className="text-neutral-400 mt-1">
              Completa las tareas para ganar experiencia y oro
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-neutral-300">
                {completedCount} / {tasks.length} Completadas
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#D89216]" />
              Tareas Disponibles
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Sube tus archivos para completar las tareas asignadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay tareas disponibles en este momento</p>
              </div>
            ) : (
              <div className="rounded-md border border-neutral-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                      <TableHead className="text-neutral-300">Título</TableHead>
                      <TableHead className="text-neutral-300">
                        Descripción
                      </TableHead>
                      <TableHead className="text-center text-neutral-300">
                        Recompensas
                      </TableHead>
                      <TableHead className="text-center text-neutral-300">
                        Estado
                      </TableHead>
                      <TableHead className="text-center text-neutral-300">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="border-neutral-800 hover:bg-neutral-900/30"
                      >
                        <TableCell className="font-medium text-neutral-100">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#D89216]" />
                            {task.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-400 max-w-md">
                          <p className="line-clamp-2 text-sm">
                            {task.description || 'Sin descripción'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-center">
                            {task.gold > 0 && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Coins className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  {task.gold} Oro
                                </span>
                              </div>
                            )}
                            {task.experience > 0 && (
                              <div className="flex items-center gap-1 text-blue-400">
                                <Trophy className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  {task.experience} XP
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {task.completed ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completada
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {task.completed ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-neutral-500 cursor-not-allowed"
                              disabled
                            >
                              Ya Entregada
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#D89216] hover:bg-[#B87A12] text-black"
                              onClick={() =>
                                router.push(
                                  `/main/dashboard/player/tasks/${task.id}/submit?courseId=${courseId}&characterId=${memberId}`
                                )
                              }
                            >
                              Subir Archivo
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}
