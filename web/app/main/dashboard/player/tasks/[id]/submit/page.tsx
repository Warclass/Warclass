"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Trophy,
  Coins,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  name: string;
  description: string | null;
  experience: number;
  gold: number;
  completed?: boolean;
}

export default function SubmitTaskPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const courseId = searchParams.get("courseId");
  const memberId = searchParams.get("memberId");
  const taskId = params.id as string;
  
  // Obtener datos del curso para el nombre
  const { courseData } = useCourseData(courseId);

  useEffect(() => {
    if (!courseId || !memberId || !taskId || !user?.id) {
      setIsLoading(false);
      return;
    }

    // Cargar información de la tarea
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            'x-user-id': user.id
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTask(data.task);
        } else {
          console.error('Error al cargar tarea:', response.status);
          router.push(`/main/dashboard/player/tasks?courseId=${courseId}`);
        }
      } catch (error) {
        console.error('Error al cargar tarea:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [courseId, memberId, taskId, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar tamaño máximo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("El archivo es demasiado grande. El tamaño máximo es 10MB.");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !courseId || !taskId || !memberId || !user) {
      return;
    }

    setIsSubmitting(true);
    setShowError(false);

    try {
      // TODO: Implementar subida de archivo real a servidor/cloud storage
      // Por ahora solo marcamos la tarea como completada
      
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          taskId,
          memberId
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push(`/main/dashboard/player/tasks?courseId=${courseId}`);
        }, 2000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Error al entregar tarea');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error al entregar tarea:', error);
      setErrorMessage('Error al conectar con el servidor');
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name} token="" courseId={courseId || undefined} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando tarea...</p>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  if (!task) {
    return (
      <PlayerLayout name={user?.name} token="" courseId={courseId || undefined} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-neutral-400">Tarea no encontrada</p>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout name={user?.name} token="" courseId={courseId || undefined} courseName={courseData?.name}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Botón Volver */}
        <Link href={`/main/dashboard/player/tasks?courseId=${courseId}`}>
          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-100">{task.name}</h1>
          <p className="text-neutral-400 mt-2">{task.description || 'Sin descripción'}</p>
        </div>

        {/* Recompensas */}
        <div className="flex gap-4">
          {task.gold > 0 && (
            <Card className="bg-[#1a1a1a] border-neutral-800 flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Coins className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Oro</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {task.gold}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {task.experience > 0 && (
            <Card className="bg-[#1a1a1a] border-neutral-800 flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Experiencia</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {task.experience}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Already Submitted Alert */}
        {task.completed && (
          <Alert className="bg-blue-900/20 border-blue-600">
            <CheckCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              Ya has entregado esta tarea. No puedes volver a entregarla.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="bg-green-900/20 border-green-600">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              ¡Tarea entregada exitosamente! Ganaste {task.gold} oro y{" "}
              {task.experience} XP. Redirigiendo...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {showError && (
          <Alert className="bg-red-900/20 border-red-600">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Card */}
        {!task.completed && (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-100 flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#D89216]" />
                Subir Archivo
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Selecciona el archivo que deseas entregar (máximo 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div className="border-2 border-dashed border-neutral-800 rounded-lg p-8 text-center hover:border-[#D89216] transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-neutral-900 rounded-full">
                    <FileText className="h-10 w-10 text-[#D89216]" />
                  </div>
                  <div>
                    <p className="text-neutral-100 font-medium">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#D89216]" />
                    <div>
                      <p className="font-medium text-neutral-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || isSubmitting}
                className="w-full bg-[#D89216] hover:bg-[#B87A12] text-black font-semibold h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Entregar Tarea
                  </>
                )}
              </Button>

              {/* Instructions */}
              <div className="text-sm text-neutral-400 space-y-2">
                <p className="font-medium text-neutral-300">Instrucciones:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Asegúrate de que el archivo contenga todo el trabajo
                    requerido
                  </li>
                  <li>El archivo debe ser legible y estar bien organizado</li>
                  <li>Una vez entregado, no podrás modificar tu entrega</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  );
}

