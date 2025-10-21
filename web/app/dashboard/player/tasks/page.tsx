"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialTasks = [
  {
    id: 1,
    title: "Tarea 1: Investigación sobre algoritmos",
    description: "Investiga sobre los principales algoritmos de ordenamiento",
    deadline: "2025-10-15",
    submitted: false,
  },
  {
    id: 2,
    title: "Tarea 2: Práctica de estructuras de datos",
    description:
      "Implementa una lista enlazada en el lenguaje de tu preferencia",
    deadline: "2025-10-20",
    submitted: false,
  },
  {
    id: 3,
    title: "Tarea 3: Proyecto final",
    description: "Desarrolla una aplicación web completa",
    deadline: "2025-10-30",
    submitted: false,
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [taskLinks, setTaskLinks] = useState<Record<number, string>>({});
  const [showSuccess, setShowSuccess] = useState<number | null>(null);

  const handleLinkChange = (taskId: number, link: string) => {
    setTaskLinks((prev) => ({
      ...prev,
      [taskId]: link,
    }));
  };

  const handleSubmit = (taskId: number) => {
    if (!taskLinks[taskId] || taskLinks[taskId].trim() === "") {
      alert("Por favor ingresa un enlace válido");
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, submitted: true } : task
      )
    );

    setShowSuccess(taskId);
    setTimeout(() => setShowSuccess(null), 3000);

    setTaskLinks((prev) => ({
      ...prev,
      [taskId]: "",
    }));

    console.log(`Tarea ${taskId} entregada con link: ${taskLinks[taskId]}`);
  };

  return (
    <PlayerLayout name="Tareas" token="temp-token">
      <div className="bg-white dark:bg-neutral-950 w-full min-h-screen flex justify-center flex-col gap-6 items-center py-10">
        <section className="w-full max-w-3xl px-4">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
            Tareas
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Completa y entrega tus tareas para ganar experiencia
          </p>
        </section>

        <Card className="w-full max-w-3xl border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl text-neutral-900 dark:text-white">
              📋 Instrucciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-700 dark:text-neutral-300">
              Sigue las instrucciones del profesor y carga el enlace de la
              actividad puesta por el profesor
            </p>
            <div className="space-y-2">
              <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
              <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
              <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-3xl border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
              📝 Tareas Asignadas
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Entrega tus tareas antes de la fecha límite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-b border-neutral-200 dark:border-neutral-800 pb-6 last:border-0"
                  >
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.submitted && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                            ✓ Entregada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {task.description}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        📅 Fecha límite:{" "}
                        {new Date(task.deadline).toLocaleDateString("es-ES")}
                      </p>
                    </div>

                    {!task.submitted && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <Label
                              htmlFor={`task-${task.id}`}
                              className="sr-only"
                            >
                              Enlace de la tarea
                            </Label>
                            <Input
                              id={`task-${task.id}`}
                              type="url"
                              placeholder="Carga el link de la tarea (ej: https://...)"
                              value={taskLinks[task.id] || ""}
                              onChange={(e) =>
                                handleLinkChange(task.id, e.target.value)
                              }
                              className="bg-neutral-50 dark:bg-neutral-900 border-yellow-500/30"
                            />
                          </div>
                          <Button
                            onClick={() => handleSubmit(task.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold"
                          >
                            Entregar
                          </Button>
                        </div>

                        {showSuccess === task.id && (
                          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <AlertDescription className="text-green-800 dark:text-green-200">
                              ✓ Tarea entregada exitosamente
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {task.submitted && (
                      <Alert className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <AlertDescription className="text-neutral-600 dark:text-neutral-400">
                          Esta tarea ya fue entregada
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}
