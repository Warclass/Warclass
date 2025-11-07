'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import MasterCourseLayout from '@/app/layouts/MasterCourseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  ClipboardList,
  Edit,
  Trash2,
  Search,
  Clock,
  Award
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Quiz {
  id: string;
  question: string;
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  groupId: string;
  created_at: Date;
}

interface Group {
  id: string;
  name: string;
}

export default function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const courseId = searchParams.get('courseId');

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Estados para crear/editar quiz
  const [quizForm, setQuizForm] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswerIndex: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    points: 100,
    timeLimit: 30,
    groupId: ''
  });

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
        
        // Si hay grupos, cargar quizzes del primer grupo como default
        if (groupsData.groups.length > 0) {
          await fetchQuizzes(groupsData.groups[0].id);
        }
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

  const fetchQuizzes = async (groupId: string) => {
    try {
      const response = await fetch(`/api/quizzes?groupId=${groupId}`, {
        headers: { 'x-user-id': user!.id }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando quizzes:', error);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.question.trim()) {
      toast({
        title: 'Error',
        description: 'La pregunta es requerida',
        variant: 'destructive'
      });
      return;
    }

    const validAnswers = quizForm.answers.filter(a => a.trim() !== '');
    if (validAnswers.length < 2) {
      toast({
        title: 'Error',
        description: 'Debe haber al menos 2 respuestas',
        variant: 'destructive'
      });
      return;
    }

    if (!quizForm.groupId) {
      toast({
        title: 'Error',
        description: 'Selecciona un grupo',
        variant: 'destructive'
      });
      return;
    }

    try {
      const answersData = quizForm.answers
        .filter(a => a.trim() !== '')
        .map((text, index) => ({
          text,
          isCorrect: index === quizForm.correctAnswerIndex
        }));

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({
          ...quizForm,
          answers: answersData
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Examen creado correctamente'
        });
        setQuizForm({
          question: '',
          answers: ['', '', '', ''],
          correctAnswerIndex: 0,
          difficulty: 'medium',
          points: 100,
          timeLimit: 30,
          groupId: groups[0]?.id || ''
        });
        setCreateModalOpen(false);
        fetchQuizzes(quizForm.groupId);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo crear el examen',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el examen',
        variant: 'destructive'
      });
    }
  };

  const handleEditQuiz = async () => {
    if (!selectedQuiz) return;

    if (!quizForm.question.trim()) {
      toast({
        title: 'Error',
        description: 'La pregunta es requerida',
        variant: 'destructive'
      });
      return;
    }

    const validAnswers = quizForm.answers.filter(a => a.trim() !== '');
    if (validAnswers.length < 2) {
      toast({
        title: 'Error',
        description: 'Debe haber al menos 2 respuestas',
        variant: 'destructive'
      });
      return;
    }

    try {
      const answersData = quizForm.answers
        .filter(a => a.trim() !== '')
        .map((text, index) => ({
          text,
          isCorrect: index === quizForm.correctAnswerIndex
        }));

      const response = await fetch(`/api/quizzes/${selectedQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({
          question: quizForm.question,
          answers: answersData,
          correctAnswerIndex: quizForm.correctAnswerIndex,
          difficulty: quizForm.difficulty,
          points: quizForm.points,
          timeLimit: quizForm.timeLimit
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Examen actualizado correctamente'
        });
        setEditModalOpen(false);
        setSelectedQuiz(null);
        fetchQuizzes(selectedQuiz.groupId);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo actualizar el examen',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error actualizando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el examen',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string, groupId: string) => {
    if (!confirm('¿Estás seguro de eliminar este examen?')) return;

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user!.id }
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Examen eliminado correctamente'
        });
        fetchQuizzes(groupId);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el examen',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error eliminando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el examen',
        variant: 'destructive'
      });
    }
  };

  const openCreateModal = () => {
    setQuizForm({
      question: '',
      answers: ['', '', '', ''],
      correctAnswerIndex: 0,
      difficulty: 'medium',
      points: 100,
      timeLimit: 30,
      groupId: groups[0]?.id || ''
    });
    setCreateModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const answersArray = [...quiz.answers.map(a => a.text)];
    // Rellenar con strings vacíos hasta 4
    while (answersArray.length < 4) {
      answersArray.push('');
    }
    setQuizForm({
      question: quiz.question,
      answers: answersArray,
      correctAnswerIndex: quiz.correctAnswerIndex,
      difficulty: quiz.difficulty,
      points: quiz.points,
      timeLimit: quiz.timeLimit,
      groupId: quiz.groupId
    });
    setEditModalOpen(true);
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...quizForm.answers];
    newAnswers[index] = value;
    setQuizForm({ ...quizForm, answers: newAnswers });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.question.toLowerCase().includes(searchQuery.toLowerCase())
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
            <p className="mt-4 text-neutral-400">Cargando exámenes...</p>
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
              Gestión de Exámenes
            </h1>
            <p className="text-neutral-400">
              Crea y administra exámenes para evaluar a tus estudiantes
            </p>
          </div>

          <Button 
            onClick={openCreateModal}
            className="bg-[#D89216] hover:bg-[#b6770f] text-black"
            disabled={groups.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Examen
          </Button>
        </div>

        {groups.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-16 w-16 text-neutral-600 mb-4" />
              <p className="text-neutral-400 text-center mb-2">
                No hay grupos creados
              </p>
              <p className="text-neutral-500 text-sm text-center">
                Debes crear al menos un grupo antes de crear exámenes
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-400">
                    Total Exámenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">{quizzes.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-400">
                    Puntos Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {quizzes.reduce((sum, q) => sum + q.points, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-400">
                    Tiempo Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {quizzes.length > 0 
                      ? Math.round(quizzes.reduce((sum, q) => sum + q.timeLimit, 0) / quizzes.length)
                      : 0
                    }s
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selector de Grupo y Buscador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardContent className="pt-6">
                  <Label className="text-neutral-300 mb-2 block">Filtrar por Grupo</Label>
                  <Select
                    value={groups[0]?.id}
                    onValueChange={(value) => fetchQuizzes(value)}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100">
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id} className="text-neutral-100">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-neutral-800">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                      placeholder="Buscar por pregunta..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Exámenes */}
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardContent className="pt-6">
                {filteredQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400 mb-2">
                      {searchQuery ? 'No se encontraron exámenes' : 'No hay exámenes creados'}
                    </p>
                    {!searchQuery && (
                      <Button 
                        onClick={openCreateModal}
                        variant="outline"
                        className="border-neutral-700 text-neutral-100 hover:bg-neutral-800 mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear tu primer examen
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => (
                      <Card key={quiz.id} className="bg-[#0a0a0a] border-neutral-800 hover:border-[#D89216] transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                                {quiz.question}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                                  {getDifficultyLabel(quiz.difficulty)}
                                </Badge>
                                <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                                  <Award className="h-3 w-3 mr-1" />
                                  {quiz.points} pts
                                </Badge>
                                <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {quiz.timeLimit}s
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {quiz.answers.map((answer, index) => (
                                  <div 
                                    key={index}
                                    className={`text-sm px-3 py-2 rounded ${
                                      answer.isCorrect
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                        : 'bg-neutral-900 text-neutral-400'
                                    }`}
                                  >
                                    {index + 1}. {answer.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(quiz)}
                                className="border-neutral-700 text-neutral-100 hover:bg-neutral-800"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteQuiz(quiz.id, quiz.groupId)}
                                className="border-red-600 text-red-600 hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Modal Crear Examen */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Crear Nuevo Examen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-question" className="text-neutral-300">Pregunta *</Label>
                <Textarea
                  id="create-question"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Escribe la pregunta del examen..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <Label className="text-neutral-300 mb-2 block">Respuestas *</Label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        id={`answer-${index}`}
                        checked={quizForm.correctAnswerIndex === index}
                        onCheckedChange={() => setQuizForm({ ...quizForm, correctAnswerIndex: index })}
                        className="border-neutral-700"
                      />
                      <Input
                        value={quizForm.answers[index]}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                        placeholder={`Respuesta ${index + 1}${index < 2 ? ' (requerida)' : ' (opcional)'}`}
                        maxLength={500}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Marca la casilla de la respuesta correcta
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-group" className="text-neutral-300">Grupo *</Label>
                  <Select
                    value={quizForm.groupId}
                    onValueChange={(value) => setQuizForm({ ...quizForm, groupId: value })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100">
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id} className="text-neutral-100">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-difficulty" className="text-neutral-300">Dificultad</Label>
                  <Select
                    value={quizForm.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setQuizForm({ ...quizForm, difficulty: value })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                      <SelectItem value="easy" className="text-neutral-100">Fácil</SelectItem>
                      <SelectItem value="medium" className="text-neutral-100">Medio</SelectItem>
                      <SelectItem value="hard" className="text-neutral-100">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-points" className="text-neutral-300">Puntos</Label>
                  <Input
                    id="create-points"
                    type="number"
                    min="10"
                    max="1000"
                    value={quizForm.points}
                    onChange={(e) => setQuizForm({ ...quizForm, points: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>

                <div>
                  <Label htmlFor="create-time" className="text-neutral-300">Tiempo Límite (seg)</Label>
                  <Input
                    id="create-time"
                    type="number"
                    min="5"
                    max="300"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })}
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
                  onClick={handleCreateQuiz}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  Crear Examen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Examen */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Editar Examen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-question" className="text-neutral-300">Pregunta *</Label>
                <Textarea
                  id="edit-question"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <Label className="text-neutral-300 mb-2 block">Respuestas *</Label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-answer-${index}`}
                        checked={quizForm.correctAnswerIndex === index}
                        onCheckedChange={() => setQuizForm({ ...quizForm, correctAnswerIndex: index })}
                        className="border-neutral-700"
                      />
                      <Input
                        value={quizForm.answers[index]}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                        placeholder={`Respuesta ${index + 1}${index < 2 ? ' (requerida)' : ' (opcional)'}`}
                        maxLength={500}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-difficulty" className="text-neutral-300">Dificultad</Label>
                  <Select
                    value={quizForm.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setQuizForm({ ...quizForm, difficulty: value })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                      <SelectItem value="easy" className="text-neutral-100">Fácil</SelectItem>
                      <SelectItem value="medium" className="text-neutral-100">Medio</SelectItem>
                      <SelectItem value="hard" className="text-neutral-100">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-points" className="text-neutral-300">Puntos</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    min="10"
                    max="1000"
                    value={quizForm.points}
                    onChange={(e) => setQuizForm({ ...quizForm, points: Number(e.target.value) })}
                    className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-time" className="text-neutral-300">Tiempo (seg)</Label>
                  <Input
                    id="edit-time"
                    type="number"
                    min="5"
                    max="300"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })}
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
                  onClick={handleEditQuiz}
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
