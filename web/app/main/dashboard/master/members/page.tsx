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
  Search, 
  Users,
  Award,
  Coins,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  character?: {
    id: string;
    name: string;
    class: {
      name: string;
    };
  } | null;
}

export default function MembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const courseId = searchParams.get('courseId');
  
  // Obtener datos del curso para el nombre
  const { courseData } = useCourseData(courseId);

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(true); // true = agregar, false = quitar

  // Estados para asignar stats
  const [statsForm, setStatsForm] = useState({
    experience: 0,
    gold: 0,
    reason: ''
  });

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    fetchMembers();
  }, [courseId, user?.id, token, router]);

  const fetchMembers = async () => {
    if (!user?.id || !courseId || !token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/characters?action=listByCourse&courseId=${courseId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            ...(user?.id ? { 'x-user-id': user.id } : {})
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transformar los datos de characters al formato esperado por Member
        const charactersData = data.data || [];
        const transformedMembers = charactersData.map((char: any) => ({
          id: char.user.id,
          name: char.user.name,
          experience: char.experience,
          gold: char.gold,
          energy: char.energy,
          group: char.group,
          character: {
            id: char.id,
            name: char.name,
            class: char.class
          }
        }));
        setMembers(transformedMembers);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los miembros',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error cargando miembros:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los miembros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStats = async () => {
    if (!selectedMember) return;
    if (!selectedMember.character?.id) {
      toast({
        title: 'Sin personaje',
        description: 'Este estudiante no tiene personaje aún',
        variant: 'destructive'
      });
      return;
    }

    if (statsForm.experience === 0 && statsForm.gold === 0) {
      toast({
        title: 'Error',
        description: 'Debes asignar al menos experiencia u oro',
        variant: 'destructive'
      });
      return;
    }

    try {
      const experience_delta = isAdding ? statsForm.experience : -statsForm.experience;
      const gold_delta = isAdding ? statsForm.gold : -statsForm.gold;

      const response = await fetch('/api/members/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(user?.id ? { 'x-user-id': user.id } : {})
        },
        body: JSON.stringify({
          character_id: selectedMember.character?.id,
          experience_delta,
          gold_delta,
          reason: statsForm.reason
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: isAdding 
            ? 'Stats asignados correctamente' 
            : 'Stats reducidos correctamente'
        });
        setStatsForm({ experience: 0, gold: 0, reason: '' });
        setAssignModalOpen(false);
        fetchMembers();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudieron actualizar los stats',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error actualizando stats:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los stats',
        variant: 'destructive'
      });
    }
  };

  const openAssignModal = (member: Member, adding: boolean) => {
    setSelectedMember(member);
    setIsAdding(adding);
    setStatsForm({ experience: 0, gold: 0, reason: '' });
    setAssignModalOpen(true);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estadísticas generales
  const totalExperience = members.reduce((sum, m) => sum + m.experience, 0);
  const totalGold = members.reduce((sum, m) => sum + m.gold, 0);
  const averageEnergy = members.length > 0 
    ? (members.reduce((sum, m) => sum + m.energy, 0) / members.length).toFixed(0)
    : 0;

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando miembros...</p>
          </div>
        </div>
      </MasterCourseLayout>
    );
  }

  return (
    <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            Gestión de Miembros
          </h1>
          <p className="text-neutral-400">
            Administra la experiencia y oro de los estudiantes del curso
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Estudiantes
                </CardTitle>
                <Users className="h-4 w-4 text-[#D89216]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">{members.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Experiencia Total
                </CardTitle>
                <Award className="h-4 w-4 text-[#D89216]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {totalExperience.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Oro Total
                </CardTitle>
                <Coins className="h-4 w-4 text-[#D89216]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {totalGold.toLocaleString()}
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
                placeholder="Buscar estudiantes por nombre..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Miembros */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="pt-6">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">
                  {searchQuery ? 'No se encontraron miembros' : 'No hay miembros en este curso'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                      <TableHead className="text-neutral-400">Estudiante</TableHead>
                      <TableHead className="text-neutral-400">Grupo</TableHead>
                      <TableHead className="text-neutral-400">Personaje</TableHead>
                      <TableHead className="text-neutral-400 text-right">Experiencia</TableHead>
                      <TableHead className="text-neutral-400 text-right">Oro</TableHead>
                      <TableHead className="text-neutral-400 text-right">Energía</TableHead>
                      <TableHead className="text-neutral-400 text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="border-neutral-800 hover:bg-neutral-900/50">
                        <TableCell className="font-medium text-neutral-100">
                          {member.name}
                        </TableCell>
                        <TableCell className="text-neutral-300">
                          {member.group ? (
                            <Badge variant="outline" className="border-neutral-700">
                              {member.group.name}
                            </Badge>
                          ) : (
                            <span className="text-neutral-500 text-sm">Sin grupo</span>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-300">
                          {member.character ? (
                            <div>
                              <p className="font-medium">{member.character.name}</p>
                              <p className="text-xs text-neutral-500">{member.character.class.name}</p>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-sm">Sin personaje</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Award className="h-3 w-3 text-[#D89216]" />
                            <span className="text-neutral-100">{member.experience}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Coins className="h-3 w-3 text-[#D89216]" />
                            <span className="text-neutral-100">{member.gold}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-neutral-100">{member.energy}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => openAssignModal(member, true)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Agregar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(member, false)}
                              className="border-red-600 text-red-600 hover:bg-red-950/20"
                            >
                              Quitar
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

        {/* Modal de Asignar/Quitar Stats */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">
                {isAdding ? 'Agregar' : 'Quitar'} Stats - {selectedMember?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience" className="text-neutral-300">Experiencia</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={statsForm.experience}
                  onChange={(e) => setStatsForm({ ...statsForm, experience: Number(e.target.value) })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="gold" className="text-neutral-300">Oro</Label>
                <Input
                  id="gold"
                  type="number"
                  min="0"
                  value={statsForm.gold}
                  onChange={(e) => setStatsForm({ ...statsForm, gold: Number(e.target.value) })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="reason" className="text-neutral-300">Razón (opcional)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    onClick={() => {
                      const quick = 'Respondió pregunta correctamente';
                      setStatsForm((s) => ({
                        ...s,
                        reason: s.reason ? `${s.reason} | ${quick}` : quick
                      }));
                    }}
                  >
                    Respondió pregunta correctamente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    onClick={() => {
                      const quick = 'Participó en clase';
                      setStatsForm((s) => ({
                        ...s,
                        reason: s.reason ? `${s.reason} | ${quick}` : quick
                      }));
                    }}
                  >
                    Participó en clase
                  </Button>
                </div>
                <Textarea
                  id="reason"
                  value={statsForm.reason}
                  onChange={(e) => setStatsForm({ ...statsForm, reason: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Ej: Participación en clase, tarea entregada..."
                  rows={3}
                />
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
                  onClick={handleAssignStats}
                  className={`flex-1 ${
                    isAdding 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {isAdding ? 'Agregar' : 'Quitar'} Stats
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MasterCourseLayout>
  );
}
