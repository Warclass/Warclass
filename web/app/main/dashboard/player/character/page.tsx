'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sword, Shield, Zap, Heart, Coins, Star, BookOpen } from 'lucide-react'
import { withAuth } from '@/lib/hoc/withAuth'

function CharacterPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [characterData, setCharacterData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    
    const courseId = searchParams.get('courseId')

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!user?.id) return
            
            if (!courseId) {
                setError('No se ha especificado un curso')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const response = await fetch(`/api/characters/course?courseId=${courseId}`, {
                    headers: {
                        'x-user-id': user.id
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    
                    if (data.success && data.hasCharacter) {
                        setCharacterData(data.data)
                    } else {
                        setError('No tienes personaje en este curso')
                        // Redirigir a crear personaje
                        router.push(`/main/dashboard/player/create-character?courseId=${courseId}`)
                    }
                } else {
                    const errorData = await response.json()
                    setError(errorData.error || 'Error al cargar personaje')
                }
            } catch (error) {
                console.error('Error al cargar personaje:', error)
                setError('Error al cargar datos del personaje')
            } finally {
                setIsLoading(false)
            }
        }

        fetchCharacterData()
    }, [user?.id, courseId, router])

    if (isLoading) {
        return (
            <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
                <div className="flex h-full justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
                        <p className="mt-4 text-neutral-400">Cargando personaje...</p>
                    </div>
                </div>
            </PlayerLayout>
        )
    }

    if (error || !characterData) {
        return (
            <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
                <div className="flex h-full justify-center items-center">
                    <Card className="bg-[#1a1a1a] border-red-800 max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-400">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-400 mb-4">{error}</p>
                            <Button 
                                onClick={() => router.push('/dashboard')}
                                className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black"
                            >
                                Volver al Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PlayerLayout>
        )
    }

    const { class: charClass, course, member } = characterData
    const experiencePercent = (characterData.experience / 1000) * 100 // Ejemplo: nivel cada 1000 exp
    const level = Math.floor(characterData.experience / 100) + 1

    return (
        <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header con info del curso */}
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none text-white">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold mb-2">
                                    {characterData.name}
                                </CardTitle>
                                <CardDescription className="text-white/90 text-lg">
                                    {charClass.name} • Nivel {level}
                                </CardDescription>
                                <CardDescription className="text-white/80 text-sm mt-1">
                                    Curso: {course.name} • Profesor: {course.teacher}
                                </CardDescription>
                            </div>
                            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                                ⚡ {charClass.speed} velocidad
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#1a1a1a] border-neutral-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-neutral-400">Experiencia</CardTitle>
                                <Star className="h-5 w-5 text-yellow-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-neutral-100">
                                        {characterData.experience}
                                    </span>
                                    <span className="text-sm text-neutral-500">/ 1000</span>
                                </div>
                                <Progress value={experiencePercent} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1a1a1a] border-neutral-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-neutral-400">Oro</CardTitle>
                                <Coins className="h-5 w-5 text-[#D89216]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-100">
                                {characterData.gold}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">Monedas disponibles</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1a1a1a] border-neutral-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-neutral-400">Energía</CardTitle>
                                <Zap className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-neutral-100">
                                        {characterData.energy}
                                    </span>
                                    <span className="text-sm text-neutral-500">/ 100</span>
                                </div>
                                <Progress value={characterData.energy} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Character Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Abilities */}
                    <Card className="bg-[#1a1a1a] border-neutral-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sword className="h-5 w-5 text-[#D89216]" />
                                Habilidades
                            </CardTitle>
                            <CardDescription>
                                Habilidades de tu personaje
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {characterData.abilities.length > 0 ? (
                                <div className="space-y-3">
                                    {characterData.abilities.map((ability: any) => (
                                        <Card key={ability.id} className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="pt-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-neutral-100">{ability.name}</h4>
                                                        <p className="text-sm text-neutral-400 mt-1">
                                                            {ability.description || 'Sin descripción'}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="border-[#D89216] text-[#D89216]">
                                                        {ability.gold} oro
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-500">
                                    <Sword className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No tienes habilidades aún</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Class Info & Stats */}
                    <div className="space-y-6">
                        <Card className="bg-[#1a1a1a] border-neutral-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-[#D89216]" />
                                    Información de Clase
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-neutral-400 mb-1">Clase</p>
                                        <p className="text-lg font-semibold text-neutral-100">{charClass.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400 mb-1">Velocidad</p>
                                        <div className="flex items-center gap-2">
                                            <Progress value={(charClass.speed / 10) * 100} className="h-2 flex-1" />
                                            <span className="text-sm font-medium text-neutral-100">{charClass.speed}/10</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#1a1a1a] border-neutral-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-[#D89216]" />
                                    Información del Member
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Nombre:</span>
                                        <span className="text-neutral-100 font-medium">{member.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Experiencia Base:</span>
                                        <span className="text-neutral-100 font-medium">{member.experience}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Oro Base:</span>
                                        <span className="text-neutral-100 font-medium">{member.gold}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Energía Base:</span>
                                        <span className="text-neutral-100 font-medium">{member.energy}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actions */}
                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => router.push(`/main/dashboard/player/tasks?courseId=${courseId}`)}
                                className="flex-1 bg-[#D89216] hover:bg-[#b6770f] text-black"
                            >
                                Ver Tareas
                            </Button>
                            <Button 
                                onClick={() => router.push(`/main/dashboard/player/quizzes?courseId=${courseId}`)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                Ver Exámenes
                            </Button>
                            <Button 
                                onClick={() => router.push(`/main/dashboard/player/members?courseId=${courseId}`)}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Ver Gremio
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PlayerLayout>
    )
}

export default withAuth(CharacterPage)
