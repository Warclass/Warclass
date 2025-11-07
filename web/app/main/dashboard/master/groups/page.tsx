'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import MasterCourseLayout from '@/app/layouts/MasterCourseLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Trash2,
  UserPlus,
  Search
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  course_id: string;
  members: Member[];
}

interface Member {
  id: string;
  name: string;
  experience: number;
  gold: number;
  energy: number;
  group?: {
    id: string;
    name: string;
  } | null;
}

export default function GroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const courseId = searchParams.get('courseId');

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para crear grupo
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
  });

  // Estados para asignar miembros
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [courseId, user?.id, router]);

  const fetchData = async () => {
    if (!user?.id || !courseId) return;

    try {
      setLoading(true);

      // Obtener grupos del curso
      const groupsResponse = await fetch(`/api/groups?courseId=${courseId}`, {
        headers: { 'x-user-id': user.id }
      });

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups || []);
      }

      // Obtener todos los miembros del curso
      const membersResponse = await fetch(`/api/courses/members?courseId=${courseId}`, {
        headers: { 'x-user-id': user.id }
      });

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setAllMembers(membersData.members || []);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del grupo es requerido',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({
          name: newGroup.name,
          description: newGroup.description,
          course_id: courseId
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Grupo creado correctamente'
        });
        setNewGroup({ name: '', description: '' });
        setCreateModalOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo crear el grupo',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creando grupo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el grupo',
        variant: 'destructive'
      });
    }
  };

  const handleAssignMembers = async () => {
    if (!selectedGroup || selectedMembers.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un miembro',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/groups/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({
          group_id: selectedGroup.id,
          member_ids: selectedMembers
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Miembros asignados correctamente'
        });
        setSelectedMembers([]);
        setAssignModalOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudieron asignar los miembros',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error asignando miembros:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron asignar los miembros',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user!.id }
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Grupo eliminado correctamente'
        });
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el grupo',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el grupo',
        variant: 'destructive'
      });
    }
  };

  const openAssignModal = (group: Group) => {
    setSelectedGroup(group);
    setSelectedMembers(group.members.map(m => m.id));
    setAssignModalOpen(true);
  };

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando grupos...</p>
          </div>
        </div>
      </MasterCourseLayout>
    );
  }

  return (
    <MasterCourseLayout courseId={courseId}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              Gestión de Grupos
            </h1>
            <p className="text-neutral-400">
              Crea grupos y asigna estudiantes para organizarlos
            </p>
          </div>

          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D89216] hover:bg-[#b6770f] text-black">
                <Plus className="h-4 w-4 mr-2" />
                Crear Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-neutral-800">
              <DialogHeader>
                <DialogTitle className="text-neutral-100">Crear Nuevo Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-neutral-300">Nombre del Grupo *</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                    placeholder="Ej: Grupo A"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-neutral-300">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                    placeholder="Descripción del grupo"
                    rows={3}
                    maxLength={500}
                  />
                </div>
                <Button 
                  onClick={handleCreateGroup}
                  className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  Crear Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Grupos */}
        {groups.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-neutral-600 mb-4" />
              <p className="text-neutral-400 text-center mb-2">
                No hay grupos creados
              </p>
              <p className="text-neutral-500 text-sm text-center mb-4">
                Crea tu primer grupo para comenzar a organizar estudiantes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-neutral-100">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="text-neutral-500 mt-1">
                          {group.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Miembros:</span>
                      <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                        {group.members?.length || 0}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => openAssignModal(group)}
                      variant="outline"
                      className="w-full border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar Miembros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Asignar Miembros */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">
                Asignar Miembros - {selectedGroup?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Buscar miembros..."
                />
              </div>

              {/* Lista de Miembros */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">
                    No hay miembros disponibles
                  </p>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, member.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                          }
                        }}
                      />
                      <Label
                        htmlFor={member.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-neutral-100 font-medium">{member.name}</p>
                            {member.group && (
                              <p className="text-xs text-neutral-500">
                                Grupo actual: {member.group.name}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            <span className="ml-2">⭐ {member.experience}</span>
                            <span className="ml-2">💰 {member.gold}</span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 border-neutral-700 text-neutral-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignMembers}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  Asignar {selectedMembers.length} miembro{selectedMembers.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MasterCourseLayout>
  );
}
