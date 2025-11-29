'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface QuizQuestion {
  question: string
  answers: { text: string }[]
  correctAnswerIndex?: number
  points: number
  timeLimit: number
  answered?: boolean
  userAnswer?: number
  isCorrect?: boolean
  pointsEarned?: number
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  difficulty: string
  points: number
  timeLimit: number
  totalQuestions: number
  questionsCompleted: number
  courseId: string
  completed: boolean
}

export default function QuizStartPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token } = useAuth()

  const quizId = params.id as string
  const courseId = searchParams.get('courseId')

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [showResults, setShowResults] = useState(false)

  // Obtener memberId
  useEffect(() => {
    const fetchMemberId = async () => {
      if (!user?.id || !courseId) return

      try {
        const response = await fetch(`/api/characters/member?userId=${user.id}&courseId=${courseId}`)
        if (response.ok) {
          const result = await response.json()
          const characterId = result?.data?.id
          if (characterId) setMemberId(characterId)
        }
      } catch (error) {
        console.error('Error al obtener memberId:', error)
      }
    }

    fetchMemberId()
  }, [user?.id, courseId])

  // Cargar quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!user?.id || !memberId) return

      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('characterId', memberId)
        const response = await fetch(`/api/quizzes/${quizId}?${params.toString()}`, {
          headers: {
            'x-user-id': user.id,
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setQuiz(data.quiz)

          // Si ya completó todo el quiz, mostrar resultados
          if (data.quiz.completed) {
            setShowResults(true)
          } else {
            // Inicializar array de respuestas
            setUserAnswers(new Array(data.quiz.totalQuestions).fill(null))

            // Timer acumulado: suma de todos los tiempos
            const total = data.quiz.questions.reduce((sum: number, q: QuizQuestion) => sum + q.timeLimit, 0)
            setTotalTime(total)
            setTimeLeft(total)
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al cargar quiz')
        }
      } catch (error) {
        console.error('Error al cargar quiz:', error)
        setError('Error al cargar quiz')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [user?.id, quizId, memberId, token])

  // Timer acumulado
  useEffect(() => {
    if (!quiz || showResults || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Auto enviar todo el quiz cuando se acaba el tiempo
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, timeLeft, showResults])

  // Cambiar de pregunta (sin resetear timer)
  const navigateToQuestion = (index: number) => {
    if (!quiz || index < 0 || index >= quiz.totalQuestions) return
    setCurrentQuestionIndex(index)
    setError(null)
  }

  // Guardar respuesta localmente
  const saveAnswer = (answer: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
    setError(null)
  }

  // Enviar todo el quiz completo
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || !memberId) return

    // Verificar que todas las preguntas tengan respuesta
    const unanswered = userAnswers.findIndex((ans, idx) => ans === null && idx < quiz.totalQuestions)
    if (unanswered !== -1) {
      setError(`Debes responder todas las preguntas. Falta la pregunta ${unanswered + 1}`)
      setCurrentQuestionIndex(unanswered)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Enviar todas las respuestas
      const responses = await Promise.all(
        userAnswers.map(async (answer, index) => {
          if (answer === null) return null

          const response = await fetch('/api/quizzes/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              quizId: quiz.id,
              characterId: memberId,
              questionIndex: index,
              selectedAnswer: answer,
              timeTaken: Math.floor(quiz.questions[index].timeLimit)
            })
          })

          return response.ok ? await response.json() : null
        })
      )

      // Actualizar quiz con todas las respuestas
      const updatedQuestions = quiz.questions.map((q, idx) => ({
        ...q,
        answered: true,
        userAnswer: userAnswers[idx] ?? 0,
        isCorrect: responses[idx]?.result?.isCorrect ?? false,
        pointsEarned: responses[idx]?.result?.pointsEarned ?? 0,
        correctAnswerIndex: responses[idx]?.result?.correctAnswer ?? 0
      }))

      setQuiz({
        ...quiz,
        questions: updatedQuestions,
        questionsCompleted: quiz.totalQuestions,
        completed: true
      })

      setShowResults(true)
    } catch (error) {
      console.error('Error al enviar quiz:', error)
      setError('Error al enviar el quiz')
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, memberId, userAnswers, totalTime, timeLeft, token])

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando quiz...</p>
          </div>
        </div>
      </PlayerLayout>
    )
  }

  if (error || !quiz) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <Card className="bg-[#1a1a1a] border-red-800 max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400">{error || 'Quiz no encontrado'}</p>
              <Button
                onClick={() => router.push(`/main/dashboard/player/quizzes?courseId=${courseId}`)}
                className="mt-4 bg-[#D89216] hover:bg-[#b6770f] text-black"
              >
                Volver a Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>
      </PlayerLayout>
    )
  }

  // Mostrar resultados finales
  if (showResults) {
    const totalPointsEarned = quiz.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0)
    const correctCount = quiz.questions.filter(q => q.isCorrect).length

    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className="bg-green-900/20">
              <CardTitle className="text-2xl text-neutral-100 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                ¡Quiz Completado!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900 p-4 rounded-lg text-center">
                  <p className="text-neutral-400 text-sm">Respuestas Correctas</p>
                  <p className="text-3xl font-bold text-green-400">{correctCount}/{quiz.totalQuestions}</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg text-center">
                  <p className="text-neutral-400 text-sm">Puntos Obtenidos</p>
                  <p className="text-3xl font-bold text-[#D89216]">{totalPointsEarned}</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg text-center">
                  <p className="text-neutral-400 text-sm">Precisión</p>
                  <p className="text-3xl font-bold text-blue-400">{Math.round((correctCount / quiz.totalQuestions) * 100)}%</p>
                </div>
              </div>

              <Separator className="bg-neutral-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-100">Revisión de Respuestas</h3>
                {quiz.questions.map((question, index) => (
                  <Card key={index} className="bg-[#0a0a0a] border-neutral-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        {question.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500 mb-1">Pregunta {index + 1}</p>
                          <p className="text-neutral-200 font-medium">{question.question}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Puntos</p>
                          <p className={`text-sm font-bold ${question.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {question.pointsEarned || 0}/{question.points}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-8">
                        {question.answers.map((answer, ansIdx) => {
                          const isUserAnswer = question.userAnswer === ansIdx
                          const isCorrectAnswer = question.correctAnswerIndex === ansIdx

                          return (
                            <div
                              key={ansIdx}
                              className={`p-2 rounded border-2 ${isCorrectAnswer
                                ? 'border-green-500 bg-green-900/20'
                                : isUserAnswer
                                  ? 'border-red-500 bg-red-900/20'
                                  : 'border-neutral-700'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-500" />}
                                <span className="text-neutral-200 text-sm">{answer.text}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => router.push(`/main/dashboard/player/quizzes?courseId=${courseId}`)}
                className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold"
              >
                Volver a Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>
      </PlayerLayout>
    )
  }

  // Formulario de pregunta actual
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progressPercentage = (quiz.questionsCompleted / quiz.totalQuestions) * 100

  return (
    <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progreso */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">
                  Pregunta {currentQuestionIndex + 1} de {quiz.totalQuestions}
                </span>
                <span className="text-neutral-400">
                  {quiz.questionsCompleted} respondidas
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Pregunta */}
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader className="bg-[#D89216] text-black">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
              <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-mono font-bold">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Pregunta {currentQuestionIndex + 1}</h3>
                {currentQuestion.answered && (
                  <div className="flex items-center gap-2">
                    {currentQuestion.isCorrect ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-400 font-medium">Correcta</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-400 font-medium">Incorrecta</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-lg text-neutral-300">{currentQuestion.question}</p>
            </div>

            <Separator className="bg-neutral-700" />

            {currentQuestion.answered ? (
              // Mostrar respuesta con feedback
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-100">Respuestas:</h3>
                {currentQuestion.answers.map((answer, index) => {
                  const isUserAnswer = currentQuestion.userAnswer === index
                  const isCorrectAnswer = currentQuestion.correctAnswerIndex === index

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${isCorrectAnswer
                        ? 'border-green-500 bg-green-900/20'
                        : isUserAnswer
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-neutral-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {isUserAnswer && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                        <span className="text-neutral-200">{answer.text}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Formulario de respuesta
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-100">Selecciona tu respuesta:</h3>
                <RadioGroup
                  value={userAnswers[currentQuestionIndex]?.toString() ?? ''}
                  onValueChange={(value) => saveAnswer(Number(value))}
                >
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 border border-neutral-700 rounded-lg p-4 hover:border-[#D89216] transition-colors"
                    >
                      <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                      <Label
                        htmlFor={`answer-${index}`}
                        className="flex-1 text-neutral-200 cursor-pointer"
                      >
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Navegación */}
            <div className="space-y-3">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>

                {currentQuestionIndex < quiz.totalQuestions - 1 ? (
                  <Button
                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                    className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting || userAnswers.some((ans, idx) => ans === null && idx < quiz.totalQuestions)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : '✓ Enviar Quiz Completo'}
                  </Button>
                )}
              </div>

              {/* Mensaje informativo si faltan respuestas */}
              {currentQuestionIndex === quiz.totalQuestions - 1 && userAnswers.some((ans, idx) => ans === null && idx < quiz.totalQuestions) && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Debes responder todas las preguntas antes de enviar el quiz.
                    Faltan {userAnswers.filter((ans, idx) => ans === null && idx < quiz.totalQuestions).length} pregunta(s).
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  )
}
