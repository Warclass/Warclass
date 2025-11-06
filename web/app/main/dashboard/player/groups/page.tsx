'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Users, Coins, Zap, Star } from 'lucide-react'
import { withAuth } from '@/lib/hoc/withAuth'

interface Group {
  id: string
  name: string
  memberCount: number
  members: Array<{
    id: string
    name: string
    experience: number
    gold: number
    energy: number
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
  }>
}

function GroupsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const courseId = searchParams.get('courseId')

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.id || !courseId) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/courses/groups?courseId=${courseId}`, {
          headers: {
            'x-user-id': user.id
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setGroups(data.data)
          } else {
            setError('Error al cargar grupos')
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al cargar grupos')
        }
      } catch (error) {
        console.error('Error al cargar grupos:', error)
        setError('Error al cargar datos de grupos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [user?.id, courseId])

  if (isLoading) {
    return (
      <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
        <div className="flex h-full justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
            <p className="mt-4 text-neutral-400">Cargando grupos...</p>
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
            <h1 className="text-3xl font-bold text-neutral-100">Grupos del Curso</h1>
            <p className="text-neutral-400 mt-1">
              {groups.length} grupo{groups.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            {groups.reduce((acc, g) => acc + g.memberCount, 0)} miembros
          </Badge>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.id} className="bg-[#1a1a1a] border-neutral-800">
              <CardHeader className="border-b border-neutral-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-[#D89216]">
                    {group.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} miembros
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-800 hover:bg-neutral-800">
                        <TableHead className="text-[#D89216] font-semibold">Alumno</TableHead>
                        <TableHead className="text-[#D89216] font-semibold">Personaje</TableHead>
                        <TableHead className="text-[#D89216] font-semibold">Clase</TableHead>
                        <TableHead className="text-[#D89216] font-semibold text-center">Nivel</TableHead>
                        <TableHead className="text-[#D89216] font-semibold text-center">Estadísticas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.members.length > 0 ? (
                        group.members.map((member) => {
                          const character = member.character;
                          const level = character 
                            ? Math.floor(character.experience / 100) + 1 
                            : 0;
                          const expInLevel = character 
                            ? character.experience % 100 
                            : 0;
                          const energyPercent = character 
                            ? character.energy 
                            : 0;

                          return (
                            <TableRow
                              key={member.id}
                              className="border-neutral-800 hover:bg-neutral-900 transition-colors"
                            >
                              <TableCell>
                                <span className="font-medium text-neutral-100">
                                  {member.name}
                                </span>
                              </TableCell>
                              <TableCell className="text-neutral-300">
                                {character?.name || (
                                  <span className="text-neutral-500 italic">Sin personaje</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {character?.class ? (
                                  <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                                    {character.class.name}
                                  </Badge>
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {character ? (
                                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                                    Nv. {level}
                                  </Badge>
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {character ? (
                                  <div className="flex items-center justify-center gap-4 bg-[#0a0a0a] rounded-lg p-2">
                                    <div className="flex items-center gap-1.5">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="text-sm font-medium text-neutral-100">
                                        {character.experience}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Coins className="h-4 w-4 text-[#D89216]" />
                                      <span className="text-sm font-medium text-neutral-100">
                                        {character.gold}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Zap className="h-4 w-4 text-green-500" />
                                      <span className="text-sm font-medium text-neutral-100">
                                        {character.energy}%
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-neutral-500">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                            No hay miembros en este grupo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}

          {groups.length === 0 && (
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg">No hay grupos en este curso</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PlayerLayout>
  )
}

export default withAuth(GroupsPage)

