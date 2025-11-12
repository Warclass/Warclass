'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { useCourseData } from '@/hooks/useCourseData'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sword, Shield, Zap, Heart, Coins, Star, BookOpen, Flame } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CustomizableCharacter } from '@/lib/character'
import type { CharacterAppearance } from '@/lib/character'
import ambienceConfig from '@/config/ambience.json'
import timeConfig from '@/config/time.json'
import { Ambience } from '@/components/three/Ambience'

export default function CharacterPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [characterData, setCharacterData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    
    const courseId = searchParams.get('courseId')
    
    // Obtener datos del curso para el nombre
    const { courseData } = useCourseData(courseId)

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
            <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} courseName={courseData?.name}>
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
            <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} courseName={courseData?.name}>
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

    // Desestructurar datos del personaje
    const charClass = characterData.class
    const course = characterData.course
    const experiencePercent = (characterData.experience / 1000) * 100 // Ejemplo: nivel cada 1000 exp
    const level = Math.floor(characterData.experience / 100) + 1

    // Validar que tengamos la información necesaria
    if (!charClass || !course) {
        return (
            <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} courseName={courseData?.name}>
                <div className="flex h-full justify-center items-center">
                    <Card className="bg-[#1a1a1a] border-red-800 max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-400">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-400 mb-4">Datos del personaje incompletos</p>
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

    console.log('🎮 Character Data:', {
        charClass,
        name: characterData.name,
        fullData: characterData
    })

    // Mapeo de nombres de clase a paths del modelo
    const classPathMap: Record<string, string> = {
        'Guerrero': 'Warrior',
        'Warrior': 'Warrior',
        'Mago': 'Mage',
        'Mage': 'Mage',
        'Arquero': 'Archer',
        'Archer': 'Archer'
    }

    // Mapeo de clase a nombre de archivo del modelo
    const classModelFileMap: Record<string, string> = {
        'Warrior': 'warrior.fbx',
        'Mage': 'witch.fbx',
        'Archer': 'archer.fbx'
    }

    // Seleccionar un ambiente aleatorio
    const ambienceNames = ['Ambience1', 'Ambience2', 'Ambience3', 'Ambience4', 'Ambience5'] as const
    const selectedAmbience = ambienceNames[Math.floor(Math.random() * ambienceNames.length)]
    const selectedAmbienceConfig = ambienceConfig[selectedAmbience]
    const selectedTimeConfig = timeConfig[selectedAmbienceConfig.time as 'day' | 'night']

    // Rotaciones específicas por ambiente (como en el código Laravel original)
    const ambienceRotations: Record<string, [number, number, number]> = {
        'Ambience1': [0, (3/4) * Math.PI, 0],
        'Ambience2': [0, (1/2) * Math.PI, 0],
        'Ambience3': [0, (1/4) * Math.PI - 0.25, 0],
        'Ambience4': [0, Math.PI, 0],
        'Ambience5': [0, (7/4) * Math.PI - 0.17, 0]
    }

    const characterRotation = ambienceRotations[selectedAmbience]

    // Usar la apariencia guardada del personaje
    const appearance: CharacterAppearance = {
        Hair: characterData.appearance?.Hair || '#8B4513',
        Eyes: characterData.appearance?.Eyes || '#0000FF',
        Skin: characterData.appearance?.Skin || '#FFE0BD',
        // Shirt: characterData.appearance?.Shirt || '#FF0000',
        // Pants: characterData.appearance?.Pants || '#2C3E50',
        // Shoes: characterData.appearance?.Shoes || '#1A1A1A'
    }

    console.log('🎨 Character appearance:', {
        saved: characterData.appearance,
        applied: appearance
    })

    // Determinar el path de la clase usando el mapeo
    const className = charClass?.name || 'Guerrero'
    const classPath = classPathMap[className] || 'Warrior' // Fallback a Warrior
    const modelFileName = classModelFileMap[classPath] || 'warrior.fbx' // Fallback a warrior.fbx
    
    // Determinar género - por defecto Female (los modelos actuales solo están en Female)
    const genderPath = 'Female'
    
    const modelPath = `/models/character_scene/Character/${classPath}/${genderPath}/${modelFileName}`
    const animationsPath = `/models/character_scene/Character/${classPath}/${genderPath}/State/`

    console.log('📂 Model paths:', { 
        className,
        classPath,
        modelFileName,
        genderPath,
        modelPath, 
        animationsPath 
    })

    return (
        <PlayerLayout name={user?.name || 'Jugador'} token="temp-token" courseId={courseId || undefined} courseName={courseData?.name}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Panel Izquierdo: solo el Personaje (3D) */}
                <div className="flex flex-col gap-4">
                    {/* Visualización 3D del personaje */}
                    <Card className="bg-[#1a1a1a] border-neutral-800 flex-1 min-h-[400px]">
                        <CardContent className="p-0 h-full">
                            <div 
                                className="relative w-full h-full rounded-lg overflow-hidden"
                                style={{
                                    background: selectedTimeConfig.skyColor
                                }}
                            >
                                <Canvas
                                    camera={{
                                        position: [
                                            selectedAmbienceConfig.cameraPosition.x,
                                            selectedAmbienceConfig.cameraPosition.y,
                                            selectedAmbienceConfig.cameraPosition.z
                                        ],
                                        fov: 75,
                                        near: 0.1,
                                        far: 1000
                                    }}
                                    gl={{
                                        antialias: true,
                                        alpha: true,
                                        toneMapping: THREE.ACESFilmicToneMapping,
                                        toneMappingExposure: selectedTimeConfig.exposure
                                    }}
                                >
                                    <Suspense fallback={null}>
                                        <ambientLight 
                                            color={selectedTimeConfig.ambientLightColor} 
                                            intensity={0.8} 
                                        />
                                        <directionalLight
                                            color={selectedTimeConfig.sunLightColor}
                                            intensity={1}
                                            position={[
                                                selectedAmbienceConfig.lights.backLight.position.x,
                                                selectedAmbienceConfig.lights.backLight.position.y,
                                                selectedAmbienceConfig.lights.backLight.position.z
                                            ]}
                                        />
                                        <spotLight
                                            color={selectedTimeConfig.frontLightColor}
                                            intensity={30}
                                            position={[5, 5, 5]}
                                            angle={0.5}
                                            penumbra={0.5}
                                        />

                                        <CustomizableCharacter
                                            modelPath={modelPath}
                                            animationsPath={animationsPath}
                                            appearance={appearance}
                                            rotation={characterRotation}
                                            autoRestartIdle={true}
                                        />

                                        <Ambience name={selectedAmbience} />
                                    </Suspense>
                                </Canvas>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panel Derecho: Header, Stats y Detalles */}
                <div className="flex flex-col gap-4 overflow-y-auto">
                    {/* Header con info del curso (movido a la derecha) */}
                    <Card className="bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 border-none text-white">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-bold mb-1">
                                        {characterData.name}
                                    </CardTitle>
                                    <CardDescription className="text-white/90">
                                        {charClass.name} • Nivel {level}
                                    </CardDescription>
                                    <CardDescription className="text-white/80 text-sm">
                                        {course.name} • {course.teacher}
                                    </CardDescription>
                                </div>
                                <Badge className="bg-white/20 text-white px-3 py-1">
                                    ⚡ {charClass.speed}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Stats compact chips */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-[#121212] border-neutral-800">
                            <CardContent className="py-3 px-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <Star className="h-4 w-4" aria-hidden="true" />
                                        <span className="text-xs text-neutral-400">XP</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-100">{characterData.experience}</span>
                                </div>
                                <Progress value={experiencePercent} className="h-1 mt-2" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#121212] border-neutral-800">
                            <CardContent className="py-3 px-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#D89216]">
                                        <Coins className="h-4 w-4" aria-hidden="true" />
                                        <span className="text-xs text-neutral-400">Oro</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-100">{characterData.gold}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#121212] border-neutral-800">
                            <CardContent className="py-3 px-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-green-500">
                                        <Zap className="h-4 w-4" aria-hidden="true" />
                                        <span className="text-xs text-neutral-400">Energía</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-100">{characterData.energy}</span>
                                </div>
                                <Progress value={characterData.energy} className="h-1 mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Character Details */}
                    {/* Abilities */}
                    <Card className="bg-[#1a1a1a] border-neutral-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sword className="h-5 w-5 text-[#D89216]" />
                                Habilidades
                            </CardTitle>
                            <CardDescription>
                                Vista previa de habilidades según tu clase
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Visual de dos habilidades fijas por clase */}
                            <div className="grid grid-cols-2 gap-3">
                                {(['Mago','Mage'].includes(className)) && (
                                    <>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-red-900/40 flex items-center justify-center">
                                                    <Flame className="h-5 w-5 text-red-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Bola de Fuego</p>
                                                    <p className="text-xs text-neutral-400">Daño mágico</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-emerald-900/30 flex items-center justify-center">
                                                    <Heart className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Curación</p>
                                                    <p className="text-xs text-neutral-400">Restaurar vida</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {(['Guerrero','Warrior'].includes(className)) && (
                                    <>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-blue-900/40 flex items-center justify-center">
                                                    <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Escudo</p>
                                                    <p className="text-xs text-neutral-400">Defensa aumentada</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-amber-900/40 flex items-center justify-center">
                                                    <Sword className="h-5 w-5 text-amber-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Ataque Crítico</p>
                                                    <p className="text-xs text-neutral-400">Golpe poderoso</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {/* Fallback simple para otras clases */}
                                {!(['Mago','Mage','Guerrero','Warrior'].includes(className)) && (
                                    <>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-neutral-800 flex items-center justify-center">
                                                    <Star className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Habilidad 1</p>
                                                    <p className="text-xs text-neutral-400">Próximamente</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-[#0a0a0a] border-neutral-700">
                                            <CardContent className="py-4 px-3 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-neutral-800 flex items-center justify-center">
                                                    <Star className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-100">Habilidad 2</p>
                                                    <p className="text-xs text-neutral-400">Próximamente</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
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
                    </div>

                    {/* Botones de navegación removidos según requerimiento */}
                </div>
            </div>
        </PlayerLayout>
    )
}
