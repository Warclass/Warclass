'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CharacterCreator } from '@/components/three/CharacterCreator'
import { CharacterInputManager } from '@/lib/character/InputManager'
import { useAuth } from '@/hooks/auth/useAuth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import * as THREE from 'three'

const characterClasses = [
  { id: 'mage', name: 'Mago', icon: '🧙‍♂️', path: 'Mage', model: 'witch.fbx' },
  { id: 'warrior', name: 'Guerrero', icon: '⚔️', path: 'Warrior', model: 'warrior.fbx' },
]

const genders = [
  { id: 'male', name: 'Masculino', icon: '♂️', path: 'Male' },
  { id: 'female', name: 'Femenino', icon: '♀️', path: 'Female' },
]

const hairColors = [
  { name: 'Rubio', hex: '#A98307' },
  { name: 'Castaño', hex: '#8B4513' },
  { name: 'Pelinegro', hex: '#000000' },
  { name: 'Pelirrojo', hex: '#FF4500' },
]

const skinColors = [
  { name: 'Clara', hex: '#FFDAB9' },
  { name: 'Media', hex: '#D2B48C' },
  { name: 'Oscura', hex: '#8B4513' },
  { name: 'Oliva', hex: '#C9B17C' },
]

const eyeColors = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Verde', hex: '#00FF00' },
  { name: 'Marrón', hex: '#8B4513' },
]

export default function CreateCharacterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedClass, setSelectedClass] = useState('warrior')
  const [selectedGender, setSelectedGender] = useState('female')
  const [characterName, setCharacterName] = useState('')
  const [hairColorIndex, setHairColorIndex] = useState(0)
  const [skinColorIndex, setSkinColorIndex] = useState(0)
  const [eyeColorIndex, setEyeColorIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [classes, setClasses] = useState<Array<{ id: string; name: string; speed: number }>>([])
  const inputManagerRef = useRef<CharacterInputManager | null>(null)

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      console.error('❌ Usuario no autenticado, redirigiendo a login')
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('🔄 Cargando clases de personajes...')
        const response = await fetch('/api/characters?action=classes', {
          headers: user?.id ? { 'x-user-id': user.id } : {}
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Clases cargadas:', data.data)
          setClasses(data.data || [])
        } else {
          console.error('❌ Error al cargar clases:', response.status)
          setLoadError('Error al cargar las clases de personaje')
        }
      } catch (error) {
        console.error('❌ Error al cargar clases:', error)
        setLoadError('Error de conexión al cargar clases')
      }
    }

    if (user?.id) {
      fetchClasses()
    }
  }, [user?.id])

  useEffect(() => {
    console.log('🎮 Inicializando InputManager...')
    const manager = new CharacterInputManager()
    inputManagerRef.current = manager

    const timer = setTimeout(() => {
      console.log('✅ Carga inicial completada')
      setIsLoading(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
      console.log('🧹 Limpiando InputManager')
    }
  }, [])

  const handleHairColorPrev = () => {
    setHairColorIndex((prev) => {
      const newIndex = prev === 0 ? hairColors.length - 1 : prev - 1
      console.log(`🔄 Cambiando color de pelo: ${hairColors[prev].name} → ${hairColors[newIndex].name} (${hairColors[newIndex].hex})`)
      return newIndex
    })
  }

  const handleHairColorNext = () => {
    setHairColorIndex((prev) => {
      const newIndex = prev === hairColors.length - 1 ? 0 : prev + 1
      console.log(`🔄 Cambiando color de pelo: ${hairColors[prev].name} → ${hairColors[newIndex].name} (${hairColors[newIndex].hex})`)
      return newIndex
    })
  }

  const handleSkinColorPrev = () => {
    setSkinColorIndex((prev) => (prev === 0 ? skinColors.length - 1 : prev - 1))
  }

  const handleSkinColorNext = () => {
    setSkinColorIndex((prev) => (prev === skinColors.length - 1 ? 0 : prev + 1))
  }

  const handleRandomize = () => {
    setSelectedClass(characterClasses[Math.floor(Math.random() * characterClasses.length)].id)
    setSelectedGender(genders[Math.floor(Math.random() * genders.length)].id)
    setHairColorIndex(Math.floor(Math.random() * hairColors.length))
    setSkinColorIndex(Math.floor(Math.random() * skinColors.length))
    setEyeColorIndex(Math.floor(Math.random() * eyeColors.length))
  }

  // Memorizar callbacks para evitar re-renders innecesarios del CharacterCreator
  const handleCharacterLoad = useCallback(() => {
    console.log('✅ Personaje y animación idle cargados correctamente')
    setIsLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!characterName.trim()) {
      alert('Por favor ingresa un nombre para tu personaje')
      return
    }

    if (!user?.id) {
      alert('No se pudo identificar al usuario')
      return
    }

    if (classes.length === 0) {
      alert('Error al cargar las clases de personaje')
      return
    }

    try {
      setIsCreating(true)

      // Obtener el classId real de la base de datos
      const selectedClassData = classes.find(c => 
        c.name.toLowerCase() === selectedClass.toLowerCase() ||
        c.name === characterClasses.find(cc => cc.id === selectedClass)?.name
      )

      if (!selectedClassData) {
        alert('Clase de personaje no válida')
        return
      }

      // TODO: Implementar lógica para obtener el memberId correcto desde el curso
      const memberId = searchParams.get('memberId') || '1'

      const characterData = {
        name: characterName,
        classId: selectedClassData.id,
        memberId: memberId,
        appearance: {
          Hair: hairColors[hairColorIndex].hex,
          Eyes: eyeColors[eyeColorIndex].hex,
          Skin: skinColors[skinColorIndex].hex,
        }
      }

      const response = await fetch('/api/characters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: characterData.name,
          classId: characterData.classId,
          memberId: characterData.memberId,
          appearance: characterData.appearance
        })
      })

      if (response.ok) {
        const data = await response.json();
        console.log('Personaje creado:', data);
        
        router.push('/main/dashboard/player');
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al crear personaje')
      }
    } catch (error) {
      console.error('Error al crear personaje:', error)
      alert('Error al crear personaje')
    } finally {
      setIsCreating(false)
    }
  }

  const ambienceConfig = {
    focusPosition: new THREE.Vector3(0, 0, 0),
    cameraPosition: new THREE.Vector3(1, 0.75, 1),
    lights: {
      frontLight: { modifier: 0 },
      backLight: { position: new THREE.Vector3(10, 10, 10) },
    },
    time: 'day' as const,
  }

  const timeConfig = {
    exposure: 2.5,
    skyColor: '#bae6fd',
    ambientLightColor: 0xfffbeb,
    frontLightColor: 0xfffbeb,
    sunLightColor: 0xfef3c7,
  }

  const selectedClassData = characterClasses.find(c => c.id === selectedClass)
  const modelPath = `/models/character_scene/Character/${selectedClassData?.path}/${genders.find(g => g.id === selectedGender)?.path}`
  const modelFile = selectedClassData?.model || 'warrior.fbx'
  
  console.log('🎨 Configuración actual:', {
    selectedClass,
    selectedGender,
    modelPath,
    modelFile,
    fullPath: `${modelPath}/${modelFile}`,
    hairColor: hairColors[hairColorIndex],
    skinColor: skinColors[skinColorIndex],
    eyeColor: eyeColors[eyeColorIndex],
    user: user?.id,
  })

  // Mostrar estado de carga mientras se autentica
  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
          <p className="text-neutral-400">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si hay
  if (loadError) {
    return (
      <div className="flex h-screen w-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-neutral-100">Error de Carga</h2>
          <p className="text-neutral-400">{loadError}</p>
          <Button onClick={() => router.push('/main/dashboard/player')} className="bg-[#D89216] hover:bg-[#b6770f]">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="w-full flex h-14 bg-[#0f0f0f] border-b border-neutral-800">
        <nav className="flex w-full justify-between px-6 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <p className="text-[#D89216] font-bold text-lg">CREAR PERSONAJE</p>
          <div className="w-40" /> {/* Spacer for centering */}
        </nav>
      </header>

      <main className="flex flex-row flex-grow relative overflow-hidde h-full">
        <section id="scene" className="fixed h-full w-full -z-10">
          {isLoading ? (
            <div className="h-full w-full bg-[#0a0a0a] flex justify-center items-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D89216] mx-auto" />
                <p className="text-neutral-400">Cargando personaje...</p>
              </div>
            </div>
          ) : (
            inputManagerRef.current && (
              <CharacterCreator
                key={`${selectedClass}-${selectedGender}`}
                modelPath={`${modelPath}/${modelFile}`}
                animationsPath={`${modelPath}/State/`}
                appearance={{
                  Hair: hairColors[hairColorIndex].hex,
                  Eyes: eyeColors[eyeColorIndex].hex,
                  Skin: skinColors[skinColorIndex].hex,
                }}
                cameraPosition={[
                  ambienceConfig.cameraPosition.x,
                  ambienceConfig.cameraPosition.y,
                  ambienceConfig.cameraPosition.z,
                ]}
                focusPosition={[
                  ambienceConfig.focusPosition.x,
                  ambienceConfig.focusPosition.y,
                  ambienceConfig.focusPosition.z,
                ]}
                rotation={[0, Math.PI * 0.25, 0]}
                timeConfig={timeConfig}
                inputManager={inputManagerRef.current}
                onLoad={handleCharacterLoad}
              />
            )
          )}
        </section>

        <section className="w-full md:w-[30rem] p-4 flex flex-col justify-between items-center bg-[#0f0f0f]/90 backdrop-blur-sm overflow-hidden border-l border-neutral-800">
          <form onSubmit={handleSubmit} className="grid grid-flow-col short:grid-flow-row grid-rows-2 short:grid-rows-none grid-cols-2 short:grid-cols-1 short:max-w-96 gap-4 h-full w-full">

            <section className="col-span-2 short:col-span-1 space-y-3">
              <Label htmlFor="characterName" className="text-neutral-100 text-base">
                Nombre del Personaje
              </Label>
              <Input
                id="characterName"
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Ingresa el nombre..."
                className="bg-[#1a1a1a] text-neutral-100 border-neutral-700 focus:border-[#D89216]"
                required
              />
            </section>

            <section className="border-[#D89216]/30 py-4">
              <div className="flex flex-row tall:flex-col items-center justify-center gap-4">
                {characterClasses.map((charClass) => (
                  <Button
                    key={charClass.id}
                    type="button"
                    onClick={() => setSelectedClass(charClass.id)}
                    className={`w-16 h-16 text-2xl ${selectedClass === charClass.id
                      ? 'bg-[#D89216] hover:bg-[#b6770f]'
                      : 'bg-[#1a1a1a] hover:bg-neutral-800'
                      }`}
                  >
                    <span className="">{charClass.icon}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className="border-[#D89216]/30">
              <div className="flex flex-row justify-center space-x-4">
                {genders.map((gender) => (
                  <Button
                    key={gender.id}
                    type="button"
                    onClick={() => setSelectedGender(gender.id)}
                    className={`text-2xl px-8 py-6 ${selectedGender === gender.id
                      ? 'bg-[#D89216] hover:bg-[#b6770f]'
                      : 'bg-[#1a1a1a] hover:bg-neutral-800'
                      }`}
                  >
                    <span>{gender.icon}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className="col-span-2 short:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-neutral-100 text-base hidden short:block">Color de cabello</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleHairColorPrev}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ‹
                  </Button>
                  <span className="text-neutral-100 min-w-[80px] text-center">
                    {hairColors[hairColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={handleHairColorNext}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ›
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-neutral-100 text-base hidden short:block">Color de piel</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleSkinColorPrev}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ‹
                  </Button>
                  <span className="text-neutral-100 min-w-[80px] text-center">
                    {skinColors[skinColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={handleSkinColorNext}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ›
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-neutral-100 text-base hidden short:block">Color de ojos</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={() => setEyeColorIndex((prev) => (prev === 0 ? eyeColors.length - 1 : prev - 1))}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ‹
                  </Button>
                  <span className="text-neutral-100 min-w-[80px] text-center">
                    {eyeColors[eyeColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setEyeColorIndex((prev) => (prev === eyeColors.length - 1 ? 0 : prev + 1))}
                    size="sm"
                    className="bg-[#D89216] hover:bg-[#b6770f] text-black"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </section>

            <Button
              type="button"
              onClick={handleRandomize}
              className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-bold text-lg py-6 hidden short:block"
            >
              🎲 Aleatorizar
            </Button>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6 col-span-2 short:col-span-1 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  ✨ Crear Personaje
                </>
              )}
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
