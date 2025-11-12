'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { useCourseData } from '@/hooks/useCourseData'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Coins, Zap, Medal } from 'lucide-react'

interface RankedMember {
  id: string
  name: string
  experience: number
  gold: number
  energy: number
  rank: number
  group: {
    id: string
    name: string
  }
  character: {
    id: string
    name: string
    experience: number
    gold: number
    energy: number
    class: {
      id: string
      name: string
      speed: number
    }
  } | null
}

export default function ScorePage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const resultParam = searchParams.get('result')
  const quizTitleParam = searchParams.get('quiz')
  const [isLoading, setIsLoading] = useState(true)
  const [ranking, setRanking] = useState<RankedMember[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const courseId = searchParams.get('courseId')
  
  // Obtener datos del curso para el nombre
  const { courseData } = useCourseData(courseId)

  // If the user just finished a quiz, build a history entry so PlayerLayout can show it
  const recentResult = resultParam ? Number(resultParam) : null
  const recentQuizTitle = quizTitleParam ? decodeURIComponent(quizTitleParam) : null
  const historyItems = recentResult !== null ? [
    {
      character: { name: user?.name || 'Jugador' },
      quiz: recentQuizTitle || 'Examen reciente',
      score: recentResult,
    }
  ] : []

  useEffect(() => {
    const fetchRanking = async () => {
      if (!user?.id || !courseId) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/courses/members?courseId=${courseId}`, {
          headers: {
            'x-user-id': user.id
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Ordenar por experiencia del character (o member si no tiene character)
            const sorted = data.data
              .map((member: any) => ({
                ...member,
                totalExperience: member.character?.experience || member.experience || 0
              }))
              .sort((a: any, b: any) => b.totalExperience - a.totalExperience)
              .map((member: any, index: number) => ({
                ...member,
                rank: index + 1
              }))
            
            setRanking(sorted)
          } else {
            setError('Error al cargar ranking')
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al cargar ranking')
        }
      } catch (error) {
        console.error('Error al cargar ranking:', error)
        setError('Error al cargar datos de ranking')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRanking()
  }, [user?.id, courseId])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: <Trophy className="h-5 w-5" />, color: 'bg-yellow-500', text: '1º' }
    if (rank === 2) return { icon: <Medal className="h-5 w-5" />, color: 'bg-gray-400', text: '2º' }
    if (rank === 3) return { icon: <Medal className="h-5 w-5" />, color: 'bg-orange-600', text: '3º' }
    return { icon: null, color: 'bg-neutral-700', text: `${rank}º` }
  }

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} courseName={courseData?.name} history={historyItems}>
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando ranking...</p>
          </div>
        </div>
      </PlayerLayout>
    )
  }

  if (error) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} history={historyItems}>
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
    <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} history={historyItems}>
      <div className="max-w-5xl mx-auto space-y-6">
        {recentResult !== null && (
          <Card className="bg-[#16201f] border-neutral-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-100">Resultado del examen</h2>
                <p className="text-neutral-300">{recentQuizTitle || 'Examen reciente'}</p>
              </div>
              <div className="text-center">
                <span className="text-4xl font-extrabold text-[#D89216]">{recentResult}%</span>
                <p className="text-sm text-neutral-400">Puntuación</p>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-100 flex items-center gap-3">
              <Trophy className="h-10 w-10 text-[#D89216]" />
              Ranking del Curso
            </h1>
            <p className="text-neutral-400 mt-2">
              Clasificación basada en experiencia ganada
            </p>
          </div>
          <Badge className="bg-[#D89216] text-black text-lg px-4 py-2">
            {ranking.length} participantes
          </Badge>
        </div>

        {ranking.length > 0 ? (
          <div className="space-y-3">
            {ranking.map((member) => {
              const badge = getRankBadge(member.rank)
              const level = member.character 
                ? Math.floor(member.character.experience / 100) + 1 
                : Math.floor(member.experience / 100) + 1
              const isTopThree = member.rank <= 3

              return (
                <Card
                  key={member.id}
                  className={`bg-[#1a1a1a] transition-all hover:scale-[1.02] ${
                    isTopThree ? 'border-[#D89216]' : 'border-neutral-800'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`${badge.color} rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0`}>
                        {badge.icon ? (
                          <div className="text-white">{badge.icon}</div>
                        ) : (
                          <span className="text-white font-bold text-lg">{badge.text}</span>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-neutral-100 truncate">
                              {member.character?.name || member.name}
                            </h3>
                            <p className="text-sm text-neutral-400">
                              {member.character ? member.character.class.name : 'Sin personaje'} • {member.group.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-bold text-neutral-100">
                                {member.character?.experience || member.experience || 0}
                              </span>
                            </div>
                            <Badge variant="outline" className="border-purple-500 text-purple-400">
                              Nv. {level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 text-lg">No hay participantes en el ranking</p>
              <p className="text-neutral-500 text-sm mt-2">
                El ranking aparecerá cuando haya miembros con experiencia
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  )
}

