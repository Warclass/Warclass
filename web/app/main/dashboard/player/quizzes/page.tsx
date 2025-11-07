'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import Link from 'next/link'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Clock, FileQuestion, Calendar, CheckCircle, XCircle, Award } from 'lucide-react'

interface Quiz {
  id: string
  question: string
  answers: { text: string }[]
  difficulty: string
  points: number
  timeLimit: number
  groupId: string
  groupName?: string
  completed?: boolean
  score?: number
  timeTaken?: number
  createdAt?: string
}

export default function QuizzesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [error, setError] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  
  const courseId = searchParams.get('courseId')

  // Obtener memberId del usuario
  useEffect(() => {
    const fetchMemberId = async () => {
      if (!user?.id || !courseId) return

      try {
        const response = await fetch(`/api/characters/member?userId=${user.id}&courseId=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          setMemberId(data.memberId)
        }
      } catch (error) {
        console.error('Error al obtener memberId:', error)
      }
    }

    fetchMemberId()
  }, [user?.id, courseId])

  // Cargar quizzes con estado de completado
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user?.id || !courseId || !memberId) return

      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/quizzes?courseId=${courseId}&memberId=${memberId}`,
          {
            headers: {
              'x-user-id': user.id
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setQuizzes(data.data)
          } else {
            setError('Error al cargar quizzes')
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al cargar quizzes')
        }
      } catch (error) {
        console.error('Error al cargar quizzes:', error)
        setError('Error al cargar datos de quizzes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [user?.id, courseId, memberId])

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando quizzes...</p>
          </div>
        </div>
      </PlayerLayout>
    )
  }

  if (error) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
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
    )
  }

  return (
    <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-100">Exámenes</h1>
            <p className="text-neutral-400 mt-2">
              Evalúa tus conocimientos y gana experiencia
            </p>
          </div>
          <Badge className="bg-green-600 text-white text-lg px-4 py-2">
            <FileQuestion className="h-5 w-5 mr-2" />
            {quizzes.length} disponibles
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
              Lee atentamente las preguntas y selecciona una respuesta. El resultado del examen
              saldrá al terminar de responder.
            </p>
            <div className="space-y-2">
              <Separator className="bg-neutral-700" />
              <ul className="list-disc list-inside text-neutral-400 space-y-1 text-sm">
                <li>Cada pregunta tiene una única respuesta correcta</li>
                <li>No puedes retroceder una vez que avances</li>
                <li>Tu progreso se guardará automáticamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neutral-100">
              🎯 Exámenes Disponibles
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Selecciona un examen para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const isCompleted = quiz.completed ?? false
                const createdDate = quiz.createdAt 
                  ? new Date(quiz.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Sin fecha'

                return (
                  <div
                    key={quiz.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-neutral-800 rounded-lg p-4 hover:border-[#D89216] transition-colors gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-neutral-100">
                          {quiz.groupName || 'Quiz'}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-2">
                        {quiz.question}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          {quiz.answers?.length || 0} respuestas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.timeLimit}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {quiz.points} puntos
                        </span>
                        {quiz.score !== undefined && (
                          <span className="flex items-center gap-1 text-green-500 font-semibold">
                            Nota: {quiz.score}%
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {createdDate}
                        </span>
                      </div>
                    </div>
                    {!isCompleted ? (
                      <Link href={`/main/dashboard/player/quizzes/${quiz.id}/start?courseId=${courseId}`}>
                        <Button className="bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold">
                          Comenzar Quiz
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        disabled 
                        variant="outline" 
                        className="border-neutral-700 text-neutral-500"
                      >
                        Ya completado
                      </Button>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <FileQuestion className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg">No hay exámenes disponibles</p>
                <p className="text-neutral-500 text-sm mt-2">
                  Los exámenes aparecerán aquí cuando el profesor los publique
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  )
}

