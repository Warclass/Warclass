/**
 * Character Scene Component
 * Escena completa del personaje con R3F
 */

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Character } from "./Character";
import { CharacterLights } from "./Lights";
import { Ambience } from "./Ambience";
import { CharacterInputManager } from "@/lib/character/InputManager";
import { AmbienceName, TimeConfig } from "@/lib/types/character";

interface CharacterSceneProps {
  characterId: number;
  ambienceName: AmbienceName;
  timeConfig: TimeConfig;
  cameraPosition: [number, number, number];
  focusPosition: [number, number, number];
  characterRotation: [number, number, number];
  lightsConfig: {
    frontLight: { modifier: number };
    backLight: { position: THREE.Vector3 };
  };
  onLoad?: () => void;
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Cargando personaje...</p>
      </div>
    </div>
  );
}

export function CharacterScene({
  ambienceName,
  timeConfig,
  cameraPosition,
  focusPosition,
  characterRotation,
  lightsConfig,
  onLoad,
}: CharacterSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputManagerRef = useRef<CharacterInputManager | null>(null);
  const [characterSize, setCharacterSize] = useState(
    new THREE.Vector3(1, 5, 1)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const inputManager = new CharacterInputManager();
    const cleanup = inputManager.init(canvas as HTMLElement);
    inputManagerRef.current = inputManager;

    return cleanup;
  }, []);

  const targetPosition = new THREE.Vector3(
    focusPosition[0],
    focusPosition[1] + (5 * characterSize.y) / 9,
    focusPosition[2]
  );

  const handleCharacterLoad = (model: THREE.Group) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    setCharacterSize(size);

    setLoading(false);
    onLoad?.();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ backgroundColor: timeConfig.skyColor }}
    >
      {loading && <LoadingScreen />}

      <Canvas
        camera={{
          position: cameraPosition,
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: timeConfig.exposure,
        }}
      >
        <Suspense fallback={null}>
          <CharacterLights
            lightsConfig={lightsConfig}
            timeConfig={timeConfig}
            targetPosition={targetPosition}
            characterSize={characterSize}
            helpers={false}
          />

          {inputManagerRef.current && (
            <Character
              modelPath="/models/character_scene/Character/Warrior/Female/warrior.fbx"
              animationsPath="/models/character_scene/Character/Warrior/Female/State/"
              position={focusPosition}
              rotation={characterRotation}
              scale={0.005}
              inputManager={inputManagerRef.current}
              onLoad={handleCharacterLoad}
            />
          )}

          <Ambience name={ambienceName} />

          <OrbitControls
            target={targetPosition}
            enablePan={false}
            enableZoom={false}
            rotateSpeed={0.075}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          id="accept"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          Aceptar
        </button>
        <button
          id="reject"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
