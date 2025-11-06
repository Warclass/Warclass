'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Zap, Star, Users } from 'lucide-react'
import { withAuth } from '@/lib/hoc/withAuth'

interface Member {
  id: string
  name: string
  experience: number
  gold: number
  energy: number
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

function MembersPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const courseId = searchParams.get('courseId')

  useEffect(() => {
    const fetchMembers = async () => {
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
            setMembers(data.data)
          } else {
            setError('Error al cargar members')
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al cargar members')
        }
      } catch (error) {
        console.error('Error al cargar members:', error)
        setError('Error al cargar datos de members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [user?.id, courseId])

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando miembros...</p>
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100">Miembros del Curso</h1>
            <p className="text-neutral-400 mt-1">
              {members.length} miembro{members.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            {members.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-neutral-100">
                      {member.character?.name || member.name}
                    </CardTitle>
                    <p className="text-sm text-neutral-400 mt-1">
                      {member.character ? member.character.class.name : 'Sin personaje'}
                    </p>
                  </div>
                  {member.character && (
                    <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                      Nv. {Math.floor(member.character.experience / 100) + 1}
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="mt-2 w-fit">
                  {member.group.name}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Estadísticas en formato compacto */}
                <div className="flex items-center justify-between bg-[#0a0a0a] rounded-lg p-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Experiencia</span>
                      <span className="text-base font-bold text-neutral-100">
                        {member.character?.experience || member.experience}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-neutral-800" />

                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-[#D89216]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Oro</span>
                      <span className="text-base font-bold text-[#D89216]">
                        {member.character?.gold || member.gold}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-neutral-800" />

                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Energía</span>
                      <span className="text-base font-bold text-neutral-100">
                        {member.character?.energy || member.energy}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-neutral-400 text-lg">No hay miembros en este curso aún</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  )
}

export default withAuth(MembersPage)

