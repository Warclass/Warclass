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
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Quiz {
  id: string
  question: string
  answers: { text: string }[]
  correctAnswerIndex: number
  difficulty: string
  points: number
  timeLimit: number
  groupId: string
  completed?: boolean
  userAnswer?: number
  isCorrect?: boolean
  pointsEarned?: number
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<{
    isCorrect: boolean
    pointsEarned: number
    correctAnswer: number
  } | null>(null)

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
      if (!user?.id) return

      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (memberId) params.set('characterId', memberId)
        const response = await fetch(`/api/quizzes/${quizId}?${params.toString()}`, {
          headers: {
            'x-user-id': user.id,
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setQuiz(data.quiz)
          
          // Si ya completó el quiz, mostrar resultado
          if (data.quiz.completed) {
            setShowResult(true)
            setSelectedAnswer(data.quiz.userAnswer)
            setResult({
              isCorrect: data.quiz.isCorrect,
              pointsEarned: data.quiz.pointsEarned,
              correctAnswer: data.quiz.correctAnswerIndex
            })
          } else {
            setTimeLeft(data.quiz.timeLimit)
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
  }, [user?.id, quizId, memberId])

  // Manejar envío de respuesta
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (selectedAnswer === null) {
      setError('Debes seleccionar una respuesta')
      return
    }

    if (!memberId || !quiz) return

    try {
      setIsSubmitting(true)
      const timeTaken = quiz.timeLimit - timeLeft

      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.id
        },
        body: JSON.stringify({
          quizId: quiz.id,
          characterId: memberId,
          selectedAnswer: selectedAnswer,
          timeTaken: timeTaken
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          isCorrect: data.result.isCorrect,
          pointsEarned: data.result.pointsEarned,
          correctAnswer: quiz.correctAnswerIndex
        })
        setShowResult(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al enviar respuesta')
      }
    } catch (error) {
      console.error('Error al enviar respuesta:', error)
      setError('Error al enviar respuesta')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedAnswer, memberId, quiz, timeLeft, user])

  // Timer
  useEffect(() => {
    if (!quiz || quiz.completed || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit() // Auto submit cuando se acaba el tiempo
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, timeLeft, handleSubmit])

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

  // Mostrar resultado
  if (showResult && result) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardHeader className={`${result.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
              <CardTitle className="text-2xl text-neutral-100 flex items-center gap-3">
                {result.isCorrect ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    ¡Correcto!
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    Incorrecto
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-neutral-100">Pregunta:</h3>
                <p className="text-lg text-neutral-300">{quiz.question}</p>
              </div>

              <Separator className="bg-neutral-700" />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-100">Respuestas:</h3>
                {quiz.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      index === result.correctAnswer
                        ? 'border-green-500 bg-green-900/20'
                        : index === selectedAnswer
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === result.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {index === selectedAnswer && index !== result.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-neutral-200">{answer.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-neutral-700" />

              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg">
                <div>
                  <p className="text-neutral-400 text-sm">Puntos obtenidos</p>
                  <p className="text-2xl font-bold text-[#D89216]">{result.pointsEarned} pts</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm">Puntos posibles</p>
                  <p className="text-2xl font-bold text-neutral-300">{quiz.points} pts</p>
                </div>
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

  // Formulario del quiz
  return (
    <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader className="bg-[#D89216] text-black">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Quiz</CardTitle>
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
              <h3 className="text-xl font-semibold text-neutral-100">Pregunta:</h3>
              <p className="text-lg text-neutral-300">{quiz.question}</p>
            </div>

            <Separator className="bg-neutral-700" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-100">Selecciona tu respuesta:</h3>
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(value) => setSelectedAnswer(Number(value))}
                >
                  {quiz.answers.map((answer, index) => (
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

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/main/dashboard/player/quizzes?courseId=${courseId}`)}
                  className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || selectedAnswer === null}
                  className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  )
}
