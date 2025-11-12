'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Zap, Star, Users, ArrowLeft } from 'lucide-react'

interface Member {
  id: string
  name: string
  experience: number
  gold: number
  energy: number
  health: number
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
    health: number
    class: {
      id: string
      name: string
      speed: number
    }
  } | null
}

interface MembersResponse {
  success: boolean
  data: Member[]
  groupId?: string
  message?: string
  error?: string
}

export default function MembersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [groupName, setGroupName] = useState<string>('')
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

        const data: MembersResponse = await response.json()
        
        if (response.ok) {
          if (data.success) {
            setMembers(data.data)
            
            // Obtener el nombre del grupo del primer miembro
            if (data.data.length > 0 && data.data[0].group) {
              setGroupName(data.data[0].group.name)
            }
            
            // Si no hay miembros pero hay mensaje, podría ser que no tiene grupo
            if (data.data.length === 0 && data.message) {
              setError(data.message)
            }
          } else {
            setError(data.error || 'Error al cargar miembros del grupo')
          }
        } else {
          setError(data.error || 'Error al cargar miembros del grupo')
        }
      } catch (error) {
        console.error('Error al cargar miembros:', error)
        setError('Error al cargar datos de miembros del grupo')
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
            <p className="mt-4 text-neutral-400">Cargando miembros del grupo...</p>
          </div>
        </div>
      </PlayerLayout>
    )
  }

  if (error) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <Card className="bg-[#1a1a1a] border-yellow-600 max-w-md">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sin grupo asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400">{error}</p>
              <p className="text-sm text-neutral-500">
                Tu profesor aún no te ha asignado a ningún grupo. Una vez que estés en un grupo, 
                podrás ver a tus compañeros de equipo aquí.
              </p>
              <Button 
                onClick={() => router.push(`/main/dashboard/player?courseId=${courseId}`)}
                className="w-full bg-[#D89216] hover:bg-[#b87a12]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
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
            <h1 className="text-3xl font-bold text-neutral-100">Miembros de tu Grupo</h1>
            {groupName && (
              <p className="text-neutral-400 mt-1">
                Grupo: <span className="text-[#D89216] font-semibold">{groupName}</span> • {members.length} miembro{members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            {members.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const level = member.character 
              ? Math.floor(member.character.experience / 100) + 1 
              : 1
            
            return (
              <Card key={member.id} className="bg-[#1a1a1a] border-neutral-800 hover:border-[#D89216] transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-neutral-100">
                        {member.name}
                      </CardTitle>
                      {member.character && (
                        <p className="text-sm text-neutral-400 mt-1">
                          {member.character.name} • {member.character.class.name}
                        </p>
                      )}
                    </div>
                    {member.character && (
                      <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                        Nv. {level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Estadísticas en formato compacto */}
                  <div className="flex items-center justify-between bg-[#0a0a0a] rounded-lg p-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-500">XP</span>
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

                  {/* Velocidad de la clase */}
                  {member.character && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Velocidad:</span>
                      <span className="text-neutral-100 font-semibold">
                        {member.character.class.speed}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {members.length === 0 && !error && (
          <Card className="bg-[#1a1a1a] border-neutral-800">
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-neutral-400 text-lg">No hay otros miembros en tu grupo aún</p>
              <p className="text-sm text-neutral-500 mt-2">Eres el primero en tu grupo</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PlayerLayout>
  )
}

