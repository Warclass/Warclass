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
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswerIndex: number;
  points: number;
  timeLimit: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  totalQuestions: number;
  courseId: string;
  createdAt: Date;
}

export default function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const courseId = searchParams.get('courseId');

  const { courseData } = useCourseData(courseId);

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Estados para crear/editar quiz
  const [quizTitle, setQuizTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswerIndex: 0,
      points: 10,
      timeLimit: 30
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Estados para IA
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [courseId, user?.id, token, router]);

  const fetchData = async () => {
    if (!user?.id || !courseId || !token) return;

    try {
      setLoading(true);
      await fetchQuizzes(courseId);
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

  const fetchQuizzes = async (currentCourseId: string) => {
    try {
      const response = await fetch(`/api/quizzes?courseId=${currentCourseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando quizzes:', error);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 20) {
      toast({
        title: 'Límite alcanzado',
        description: 'Máximo 20 preguntas por quiz',
        variant: 'destructive'
      });
      return;
    }

    setQuestions([...questions, {
      question: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswerIndex: 0,
      points: 10,
      timeLimit: 30
    }]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 5) {
      toast({
        title: 'Mínimo requerido',
        description: 'El quiz debe tener al menos 5 preguntas',
        variant: 'destructive'
      });
      return;
    }

    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newAnswers = [...newQuestions[questionIndex].answers];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], text: value };
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      answers: newAnswers
    };
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];
    const newAnswers = newQuestions[questionIndex].answers.map((a, i) => ({
      text: a.text,
      isCorrect: i === answerIndex
    }));
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      answers: newAnswers,
      correctAnswerIndex: answerIndex
    };
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast({
        title: 'Error',
        description: 'El título del quiz es requerido',
        variant: 'destructive'
      });
      return false;
    }

    if (questions.length < 5) {
      toast({
        title: 'Error',
        description: 'El quiz debe tener al menos 5 preguntas',
        variant: 'destructive'
      });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.question.trim().length < 10) {
        toast({
          title: 'Error',
          description: `La pregunta ${i + 1} debe tener al menos 10 caracteres`,
          variant: 'destructive'
        });
        return false;
      }

      const validAnswers = q.answers.filter(a => a.text.trim() !== '');
      if (validAnswers.length < 2) {
        toast({
          title: 'Error',
          description: `La pregunta ${i + 1} debe tener al menos 2 respuestas`,
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        answers: q.answers.map((a, idx) => ({
          text: a.text,
          isCorrect: idx === q.correctAnswerIndex
        })).filter(a => a.text.trim() !== ''),
        correctAnswerIndex: q.correctAnswerIndex,
        points: q.points,
        timeLimit: q.timeLimit
      }));

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          questions: formattedQuestions,
          difficulty,
          courseId
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Quiz creado correctamente'
        });
        resetForm();
        setCreateModalOpen(false);
        fetchQuizzes(courseId || '');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo crear el quiz',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el quiz',
        variant: 'destructive'
      });
    }
  };

  const handleEditQuiz = async () => {
    if (!selectedQuiz || !validateQuiz()) return;

    try {
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        answers: q.answers.map((a, idx) => ({
          text: a.text,
          isCorrect: idx === q.correctAnswerIndex
        })).filter(a => a.text.trim() !== ''),
        correctAnswerIndex: q.correctAnswerIndex,
        points: q.points,
        timeLimit: q.timeLimit
      }));

      const response = await fetch(`/api/quizzes/${selectedQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          questions: formattedQuestions,
          difficulty
        })
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Quiz actualizado correctamente'
        });
        setEditModalOpen(false);
        setSelectedQuiz(null);
        fetchQuizzes(courseId || '');
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'No se pudo actualizar el quiz',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error actualizando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el quiz',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('¿Estás seguro de eliminar este quiz?')) return;

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Quiz eliminado correctamente'
        });
        fetchQuizzes(courseId || '');
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el quiz',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error eliminando quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el quiz',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setQuizTitle('');
    setDifficulty('medium');
    setQuestions([{
      question: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswerIndex: 0,
      points: 10,
      timeLimit: 30
    }]);
    setCurrentQuestionIndex(0);
  };

  const handleGenerateQuiz = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un tema',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: aiTopic,
          difficulty: aiDifficulty,
          count: aiCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedQuestions = data.questions.map((q: any) => ({
          question: q.question,
          answers: q.answers,
          correctAnswerIndex: q.answers.findIndex((a: any) => a.isCorrect),
          points: q.points,
          timeLimit: q.timeLimit
        }));

        setQuestions(generatedQuestions);
        setQuizTitle(`Quiz de ${aiTopic}`);
        setDifficulty(aiDifficulty);
        setAiModalOpen(false);
        setAiTopic('');
        toast({
          title: 'Éxito',
          description: 'Preguntas generadas correctamente'
        });
      } else {
        throw new Error('Error generando preguntas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar las preguntas',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizTitle(quiz.title);
    setDifficulty(quiz.difficulty);

    // Convertir las preguntas del quiz al formato del formulario
    const formQuestions = quiz.questions.map(q => {
      // Asegurar que siempre haya 4 respuestas
      const allAnswers = [
        ...q.answers,
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ].slice(0, 4);

      return {
        question: q.question,
        answers: allAnswers,
        correctAnswerIndex: q.correctAnswerIndex,
        points: q.points,
        timeLimit: q.timeLimit
      };
    });

    setQuestions(formQuestions);
    setCurrentQuestionIndex(0);
    setEditModalOpen(true);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return diff;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentQuestion = questions[currentQuestionIndex];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const totalTime = questions.reduce((sum, q) => sum + q.timeLimit, 0);

  if (!courseId) {
    return null;
  }

  if (loading) {
    return (
      <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto"></div>
            <p className="mt-4 text-neutral-400">Cargando quizzes...</p>
          </div>
        </div>
      </MasterCourseLayout>
    );
  }

  const isModalOpen = createModalOpen || editModalOpen;
  const modalTitle = createModalOpen ? "Crear Nuevo Quiz" : "Editar Quiz";
  const handleSubmit = createModalOpen ? handleCreateQuiz : handleEditQuiz;
  const handleClose = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
  };

  return (
    <MasterCourseLayout courseId={courseId} courseName={courseData?.name}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              Gestión de Quizzes
            </h1>
            <p className="text-neutral-400">
              Crea y administra quizzes para evaluar a tus estudiantes
            </p>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-[#D89216] hover:bg-[#b6770f] text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Quiz
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">{quizzes.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Total Preguntas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-100">
                {quizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0)}
              </div>
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
                placeholder="Buscar por título..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Quizzes */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="pt-6">
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 mb-2">
                  {searchQuery ? 'No se encontraron quizzes' : 'No hay quizzes creados'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={openCreateModal}
                    variant="outline"
                    className="border-neutral-700 text-neutral-100 hover:bg-neutral-800 mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primer quiz
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
                            {quiz.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                              {getDifficultyLabel(quiz.difficulty)}
                            </Badge>
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              {quiz.totalQuestions} pregunta{quiz.totalQuestions !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                              <Award className="h-3 w-3 mr-1" />
                              {quiz.points} pts
                            </Badge>
                            <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor(quiz.timeLimit / 60)}:{String(quiz.timeLimit % 60).padStart(2, '0')}
                            </Badge>
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
                            onClick={() => handleDeleteQuiz(quiz.id)}
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

        {/* Modal Único para Crear/Editar */}
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">{modalTitle}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Título del Quiz */}
              <div>
                <Label htmlFor="quiz-title" className="text-neutral-300">Título del Quiz *</Label>
                <Input
                  id="quiz-title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100"
                  placeholder="Ej: Examen de Matemáticas - Unidad 1"
                  maxLength={100}
                />
              </div>

              {/* Dificultad */}
              <div>
                <Label className="text-neutral-300">Dificultad</Label>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                    <SelectItem value="easy" className="text-neutral-100">Fácil</SelectItem>
                    <SelectItem value="hard" className="text-neutral-100">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botón IA */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setAiModalOpen(true)}
                  className="border-[#D89216] text-[#D89216] hover:bg-[#D89216]/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar con IA
                </Button>
              </div>

              {/* Navegación de Preguntas */}
              <div className="border-t border-neutral-800 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="border-neutral-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="border-neutral-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={addQuestion}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={questions.length >= 20}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeQuestion(currentQuestionIndex)}
                      disabled={questions.length <= 5}
                      className="border-red-600 text-red-600 hover:bg-red-950/20"
                    >
                      <X className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pregunta Actual */}
              <div className="space-y-4 bg-[#0a0a0a] p-4 rounded-lg">
                <div>
                  <Label className="text-neutral-300">Pregunta *</Label>
                  <Textarea
                    value={currentQuestion.question}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    className="bg-[#1a1a1a] border-neutral-700 text-neutral-100"
                    placeholder="Escribe la pregunta..."
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Mínimo 10 caracteres. {currentQuestion.question.length}/1000
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-neutral-300">Puntos</Label>
                      <Input
                        type="number"
                        min="10"
                        max="500"
                        value={currentQuestion.points}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'points', Number(e.target.value))}
                        className="bg-[#1a1a1a] border-neutral-700 text-neutral-100"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-300">Tiempo (seg)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={currentQuestion.timeLimit}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'timeLimit', Number(e.target.value))}
                        className="bg-[#1a1a1a] border-neutral-700 text-neutral-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Respuestas */}
                <div className="space-y-3">
                  <Label className="text-neutral-300">Respuestas (Selecciona la correcta)</Label>
                  <div className="space-y-2">
                    {currentQuestion.answers.map((answer, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors ${idx === currentQuestion.correctAnswerIndex
                            ? 'border-green-500 bg-green-500/20 text-green-500'
                            : 'border-neutral-600 hover:border-neutral-500'
                            }`}
                          onClick={() => setCorrectAnswer(currentQuestionIndex, idx)}
                        >
                          {idx === currentQuestion.correctAnswerIndex && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                        </div>
                        <Input
                          value={answer.text}
                          onChange={(e) => updateAnswer(currentQuestionIndex, idx, e.target.value)}
                          className={`bg-[#1a1a1a] border-neutral-700 text-neutral-100 ${idx === currentQuestion.correctAnswerIndex ? 'border-green-500/50' : ''
                            }`}
                          placeholder={`Respuesta ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-neutral-900 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-neutral-300 mb-2">Resumen del Quiz</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Preguntas:</span>
                    <span className="ml-2 text-neutral-100">{questions.length}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Puntos totales:</span>
                    <span className="ml-2 text-[#D89216]">{totalPoints}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Tiempo total:</span>
                    <span className="ml-2 text-neutral-100">{Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-neutral-700 text-neutral-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                >
                  {createModalOpen ? 'Crear Quiz' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Generar IA */}
        <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-neutral-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D89216]" />
                Generar Quiz con IA
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-neutral-300">Tema del Quiz</Label>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej: Historia del Perú, Ecuaciones Cuadráticas..."
                  className="bg-[#0a0a0a] border-neutral-700 text-neutral-100 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-300">Dificultad</Label>
                  <Select value={aiDifficulty} onValueChange={(v: any) => setAiDifficulty(v)}>
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100 mt-1">
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
                  <Label className="text-neutral-300">Cantidad</Label>
                  <Select value={String(aiCount)} onValueChange={(v) => setAiCount(Number(v))}>
                    <SelectTrigger className="bg-[#0a0a0a] border-neutral-700 text-neutral-100 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-neutral-700">
                      <SelectItem value="5" className="text-neutral-100">5 Preguntas</SelectItem>
                      <SelectItem value="10" className="text-neutral-100">10 Preguntas</SelectItem>
                      <SelectItem value="15" className="text-neutral-100">15 Preguntas</SelectItem>
                      <SelectItem value="20" className="text-neutral-100">20 Preguntas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black mt-4"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Preguntas
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MasterCourseLayout >
  );
}
