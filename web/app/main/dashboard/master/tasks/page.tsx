'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourseData } from '@/hooks/useCourseData';
import MasterCourseLayout from '@/app/layouts/MasterCourseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus,
  FileText,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Task {
  id: string;
  name: string;
  description: string | null;
  experience: number;
  gold: number;
  health: number;
  energy: number;
  created_at: Date;
  assignedCount?: number;
}

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const courseId = searchParams.get('courseId');
  
  // Obtener datos del curso para el nombre
  const { courseData } = useCourseData(courseId);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Estados para crear/editar tarea
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    experience: 0,
    gold: 0,
    health: 0,
    energy: 0
  });

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    fetchTasks();
  }, [courseId, user?.id, token, router]);

  const fetchTasks = async () => {
    if (!user?.id || !courseId || !token) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/tasks/course/${courseId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las tareas',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error cargando tareas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la tarea es requerido',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskForm)
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Tarea creada correctamente'
        });
        setTaskForm({ name: '', description: '', experience: 0, gold: 0, health: 0, energy: 0 });
        setCreateModalOpen(false);
        fetchTasks();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo crear la tarea',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creando tarea:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la tarea',
        variant: 'destructive'
      });
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;

    if (!taskForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la tarea es requerido',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskForm)
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Tarea actualizada correctamente'
        });
        setEditModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo actualizar la tarea',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la tarea',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Tarea eliminada correctamente'
        });
        fetchTasks();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la tarea',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarea',
        variant: 'destructive'
      });
    }
  };

  const openCreateModal = () => {
    setTaskForm({ name: '', description: '', experience: 0, gold: 0, health: 0, energy: 0 });
    setCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      experience: task.experience,
      gold: task.gold,
      health: task.health,
      energy: task.energy
    });
    setEditModalOpen(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando tareas...</p>
          </div>
        </div>
      </MasterCourseLayout>
    );
  }

  return (
    <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              Gestión de Tareas
            </h1>
            <p className="text-neutral-400">
              Crea y administra tareas para tus estudiantes
            </p>
          </div>

          <Button 
            onClick={openCreateModal}
            className="bg-[#D89216] hover:bg-[#b6770f] text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Tarea
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Total Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Experiencia Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {tasks.reduce((sum, t) => sum + t.experience, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Oro Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {tasks.reduce((sum, t) => sum + t.gold, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buscador */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                placeholder="Buscar tareas por nombre..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Tareas */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="pt-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 mb-2">
                  {searchQuery ? 'No se encontraron tareas' : 'No hay tareas creadas'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={openCreateModal}
                    variant="outline"
                    className="border-neutral-700 text-neutral-100 hover:bg-neutral-800 mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primera tarea
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                      <TableHead className="text-neutral-400">Nombre</TableHead>
                      <TableHead className="text-neutral-400">Descripción</TableHead>
                      <TableHead className="text-neutral-400 text-right">Experiencia</TableHead>
                      <TableHead className="text-neutral-400 text-right">Oro</TableHead>
                      <TableHead className="text-neutral-400 text-right">Vida</TableHead>
                      <TableHead className="text-neutral-400 text-right">Energía</TableHead>
                      <TableHead className="text-neutral-400 text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} className="border-neutral-800 hover:bg-neutral-900/50">
                        <TableCell className="font-medium text-neutral-100">
                          {task.name}
                        </TableCell>
                        <TableCell className="text-neutral-300 max-w-xs truncate">
                          {task.description || <span className="text-neutral-600 italic">Sin descripción</span>}
                        </TableCell>
                        <TableCell className="text-right text-neutral-100">
                          {task.experience}
                        </TableCell>
                        <TableCell className="text-right text-neutral-100">
                          {task.gold}
                        </TableCell>
                        <TableCell className="text-right text-neutral-100">
                          {task.health}
                        </TableCell>
                        <TableCell className="text-right text-neutral-100">
                          {task.energy}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(task)}
                              className="border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTask(task.id)}
                              className="border-red-600 text-red-600 hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Crear Tarea */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name" className="text-neutral-300">Nombre *</Label>
                <Input
                  id="create-name"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Ej: Tarea de Base de Datos"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="create-description" className="text-neutral-300">Descripción</Label>
                <Textarea
                  id="create-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Descripción de la tarea..."
                  rows={3}
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-experience" className="text-neutral-300">Experiencia</Label>
                  <Input
                    id="create-experience"
                    type="number"
                    min="0"
                    value={taskForm.experience}
                    onChange={(e) => setTaskForm({ ...taskForm, experience: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="create-gold" className="text-neutral-300">Oro</Label>
                  <Input
                    id="create-gold"
                    type="number"
                    min="0"
                    value={taskForm.gold}
                    onChange={(e) => setTaskForm({ ...taskForm, gold: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="create-health" className="text-neutral-300">Vida</Label>
                  <Input
                    id="create-health"
                    type="number"
                    value={taskForm.health}
                    onChange={(e) => setTaskForm({ ...taskForm, health: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="create-energy" className="text-neutral-300">Energía</Label>
                  <Input
                    id="create-energy"
                    type="number"
                    value={taskForm.energy}
                    onChange={(e) => setTaskForm({ ...taskForm, energy: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 border-neutral-700 text-neutral-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTask}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  Crear Tarea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Tarea */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Editar Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-neutral-300">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-neutral-300">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  rows={3}
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-experience" className="text-neutral-300">Experiencia</Label>
                  <Input
                    id="edit-experience"
                    type="number"
                    min="0"
                    value={taskForm.experience}
                    onChange={(e) => setTaskForm({ ...taskForm, experience: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gold" className="text-neutral-300">Oro</Label>
                  <Input
                    id="edit-gold"
                    type="number"
                    min="0"
                    value={taskForm.gold}
                    onChange={(e) => setTaskForm({ ...taskForm, gold: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-health" className="text-neutral-300">Vida</Label>
                  <Input
                    id="edit-health"
                    type="number"
                    value={taskForm.health}
                    onChange={(e) => setTaskForm({ ...taskForm, health: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-energy" className="text-neutral-300">Energía</Label>
                  <Input
                    id="edit-energy"
                    type="number"
                    value={taskForm.energy}
                    onChange={(e) => setTaskForm({ ...taskForm, energy: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 border-neutral-700 text-neutral-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditTask}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MasterCourseLayout>
  );
}
