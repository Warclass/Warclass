"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import PlayerLayout from "@/app/layouts/PlayerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, CheckCircle, Clock, Link as LinkIcon } from "lucide-react";
import { withAuth } from "@/lib/hoc/withAuth";

interface Task {
  id: string;
  name: string;
  description: string | null;
  deadline: string;
  created_at: string;
}

function TasksPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskLinks, setTaskLinks] = useState<Record<string, string>>({});
  const [submittedTasks, setSubmittedTasks] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const courseId = searchParams.get("courseId");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id || !courseId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/courses/tasks?courseId=${courseId}`,
          {
            headers: {
              "x-user-id": user.id,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTasks(data.data);
          } else {
            setError("Error al cargar tareas");
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Error al cargar tareas");
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error);
        setError("Error al cargar datos de tareas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id, courseId]);

  const handleLinkChange = (taskId: string, link: string) => {
    setTaskLinks((prev) => ({
      ...prev,
      [taskId]: link,
    }));
  };

  const handleSubmit = (taskId: string) => {
    if (!taskLinks[taskId] || taskLinks[taskId].trim() === "") {
      alert("Por favor ingresa un enlace válido");
      return;
    }

    // Aquí deberías hacer un POST a la API para guardar la entrega
    setSubmittedTasks((prev) => new Set(prev).add(taskId));
    setShowSuccess(taskId);
    setTimeout(() => setShowSuccess(null), 3000);

    setTaskLinks((prev) => ({
      ...prev,
      [taskId]: "",
    }));

    console.log(`Tarea ${taskId} entregada con link: ${taskLinks[taskId]}`);
  };

  if (isLoading) {
    return (
      <PlayerLayout
        name={user?.name || "Jugador"}
        token="temp-token"
        courseId={courseId || undefined}
      >
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando tareas...</p>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  if (error) {
    return (
      <PlayerLayout
        name={user?.name || "Jugador"}
        token="temp-token"
        courseId={courseId || undefined}
      >
        <div className="flex h-full justify-center items-center">
          <Card className="bg-[#1a1a1a] border-red-800 max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout
      name={user?.name || "Jugador"}
      token="temp-token"
      courseId={courseId || undefined}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-100">Tareas</h1>
            <p className="text-neutral-400 mt-2">
              Completa y entrega tus tareas para ganar experiencia
            </p>
          </div>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
            <FileText className="h-5 w-5 mr-2" />
            {tasks.length} tareas
          </Badge>
        </div>

        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl text-neutral-100 flex items-center gap-2">
              📋 Instrucciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-300">
              Sigue las instrucciones del profesor y carga el enlace de la
              actividad puesta por el profesor
            </p>
            <ul className="list-disc list-inside text-neutral-400 space-y-1 text-sm">
              <li>Lee cuidadosamente la descripción de cada tarea</li>
              <li>Entrega antes de la fecha límite</li>
              <li>Proporciona un enlace válido a tu trabajo</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neutral-100">
              📝 Tareas Asignadas
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Entrega tus tareas antes de la fecha límite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {tasks.length > 0 ? (
                <div className="space-y-6">
                  {tasks.map((task) => {
                    const isSubmitted = submittedTasks.has(task.id);
                    const deadlineDate = new Date(task.deadline);
                    const isOverdue = deadlineDate < new Date();
                    const formattedDeadline = deadlineDate.toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    );

                    return (
                      <div
                        key={task.id}
                        className="border border-neutral-800 rounded-lg p-4 space-y-4 hover:border-[#D89216] transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xl font-semibold text-neutral-100">
                              {task.name}
                            </h3>
                            {isSubmitted ? (
                              <Badge className="bg-green-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Entregada
                              </Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive">
                                <Clock className="h-3 w-3 mr-1" />
                                Vencida
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-sm text-neutral-400">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Límite: {formattedDeadline}
                            </span>
                          </div>
                        </div>

                        {showSuccess === task.id && (
                          <Alert className="bg-green-900/20 border-green-600">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-400">
                              ¡Tarea entregada exitosamente!
                            </AlertDescription>
                          </Alert>
                        )}

                        {!isSubmitted && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`link-${task.id}`}
                                className="text-neutral-300"
                              >
                                Enlace de entrega
                              </Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                  <Input
                                    id={`link-${task.id}`}
                                    type="url"
                                    placeholder="https://..."
                                    value={taskLinks[task.id] || ""}
                                    onChange={(e) =>
                                      handleLinkChange(task.id, e.target.value)
                                    }
                                    className="bg-neutral-900 border-neutral-700 text-neutral-100 pl-10"
                                  />
                                </div>
                                <Button
                                  onClick={() => handleSubmit(task.id)}
                                  className="bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold"
                                >
                                  Entregar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-lg">
                    No hay tareas asignadas
                  </p>
                  <p className="text-neutral-500 text-sm mt-2">
                    Las tareas aparecerán aquí cuando el profesor las publique
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}

export default withAuth(TasksPage);

