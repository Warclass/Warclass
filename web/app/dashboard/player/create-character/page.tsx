'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CharacterCreator } from '@/components/three/CharacterCreator'
import { CharacterInputManager } from '@/lib/character/InputManager'
import * as THREE from 'three'

const characterClasses = [
  { id: 'mage', name: 'Mago', icon: '🧙‍♂️', path: 'Mage' },
  { id: 'warrior', name: 'Guerrero', icon: '⚔️', path: 'Warrior' },
]

const genders = [
  { id: 'male', name: 'Masculino', icon: '♂️', path: 'Male' },
  { id: 'female', name: 'Femenino', icon: '♀️', path: 'Female' },
]

const hairColors = [
  { name: 'Rubio', hex: '#FFD700' },
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
  const [selectedClass, setSelectedClass] = useState('warrior')
  const [selectedGender, setSelectedGender] = useState('female')
  const [hairColorIndex, setHairColorIndex] = useState(0)
  const [skinColorIndex, setSkinColorIndex] = useState(0)
  const [eyeColorIndex, setEyeColorIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const inputManagerRef = useRef<CharacterInputManager | null>(null)

  useEffect(() => {
    inputManagerRef.current = new CharacterInputManager()
    
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      clearTimeout(timer)
      inputManagerRef.current?.destroy()
    }
  }, [])

  const handleHairColorPrev = () => {
    setHairColorIndex((prev) => {
      const newIndex = prev === 0 ? hairColors.length - 1 : prev - 1;
      console.log(`🔄 Cambiando color de pelo: ${hairColors[prev].name} → ${hairColors[newIndex].name} (${hairColors[newIndex].hex})`);
      return newIndex;
    });
  }

  const handleHairColorNext = () => {
    setHairColorIndex((prev) => {
      const newIndex = prev === hairColors.length - 1 ? 0 : prev + 1;
      console.log(`🔄 Cambiando color de pelo: ${hairColors[prev].name} → ${hairColors[newIndex].name} (${hairColors[newIndex].hex})`);
      return newIndex;
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const characterData = {
      class: selectedClass,
      gender: selectedGender,
      appearance: {
        Hair: hairColors[hairColorIndex].hex,
        Eyes: eyeColors[eyeColorIndex].hex,
        Skin: skinColors[skinColorIndex].hex,
      }
    }
    
    console.log('Character Created:', characterData)
  }

  const ambienceConfig = {
    focusPosition: new THREE.Vector3(0, 0, 0),
    cameraPosition: new THREE.Vector3(0, 1, 3),
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

  const modelPath = `/models/character_scene/Character/${characterClasses.find(c => c.id === selectedClass)?.path}/${genders.find(g => g.id === selectedGender)?.path}`

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="w-full flex h-14 bg-neutral-900 border-b border-neutral-800">
        <nav className="flex w-full justify-between px-6 items-center">
          <p className="text-yellow-500 font-bold text-lg">WARCLASS</p>
          <p className="text-white font-semibold">CREAR PERSONAJE</p>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            👤
          </Button>
        </nav>
      </header>

      <main className="flex flex-row flex-grow relative overflow-hidden bg-neutral-900/90 h-full">
        <section id="scene" className="fixed h-full w-full -z-10">
          {isLoading ? (
            <div className="h-full w-full bg-neutral-900 flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500" />
            </div>
          ) : (
            inputManagerRef.current && (
              <CharacterCreator
                key={`${hairColorIndex}-${skinColorIndex}-${eyeColorIndex}`}
                modelPath={`${modelPath}/warrior.fbx`}
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
                rotation={[0, Math.PI * 0.75, 0]}
                timeConfig={timeConfig}
                inputManager={inputManagerRef.current}
                onLoad={() => console.log('Character loaded!')}
              />
            )
          )}
        </section>

        <section className="w-full md:w-[30rem] p-4 flex flex-col justify-between items-center bg-neutral-950/80 backdrop-blur-sm overflow-hidden ">
          <form onSubmit={handleSubmit} className="grid grid-flow-col short:grid-flow-row grid-rows-2 short:grid-rows-none grid-cols-2 short:grid-cols-1 short:max-w-96 gap-4 h-full ">

            <section className="border-yellow-500/30 py-4">
              <div className="flex flex-row tall:flex-col items-center justify-center gap-4">
                {characterClasses.map((charClass) => (
                  <Button
                    key={charClass.id}
                    type="button"
                    onClick={() => setSelectedClass(charClass.id)}
                    className={`w-16 h-16 text-2xl ${selectedClass === charClass.id
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-neutral-800 hover:bg-neutral-700'
                      }`}
                  >
                    <span className="">{charClass.icon}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className=" border-yellow-500/30">
              <div className="flex flex-row justify-center space-x-4">
                {genders.map((gender) => (
                  <Button
                    key={gender.id}
                    type="button"
                    onClick={() => setSelectedGender(gender.id)}
                    className={`text-2xl px-8 py-6 ${selectedGender === gender.id
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-neutral-800 hover:bg-neutral-700'
                      }`}
                  >
                    {gender.icon}
                  </Button>
                ))}
              </div>
            </section>

            <section className=" border-yellow-500/30 space-y-4 p-4 overflow-y-auto">
              <Label className="text-white text-base block short:hidden">Rasgos:</Label>
              
              <div className="flex items-center justify-between">
                <Label className="text-white text-base hidden short:block">Color de pelo</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleHairColorPrev}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ‹
                  </Button>
                  <span className="text-white min-w-[80px] text-center">
                    {hairColors[hairColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={handleHairColorNext}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ›
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white text-base hidden short:block">Color de piel</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleSkinColorPrev}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ‹
                  </Button>
                  <span className="text-white min-w-[80px] text-center">
                    {skinColors[skinColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={handleSkinColorNext}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ›
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white text-base hidden short:block">Color de ojos</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={() => setEyeColorIndex((prev) => (prev === 0 ? eyeColors.length - 1 : prev - 1))}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ‹
                  </Button>
                  <span className="text-white min-w-[80px] text-center">
                    {eyeColors[eyeColorIndex].name}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setEyeColorIndex((prev) => (prev === eyeColors.length - 1 ? 0 : prev + 1))}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </section>

            <Button
              type="button"
              onClick={handleRandomize}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-bold text-lg py-6 hidden short:block"
            >
              🎲 Aleatorizar
            </Button>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6 col-span-2 short:col-span-1"
            >
              ✨ Crear Personaje
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
