/**
 * Character Creator Component
 * Componente de UI para creación de personajes con preview 3D
 */

"use client";

import { useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CharacterInputManager } from "@/lib/character/InputManager";
import { CustomizableCharacter } from "@/lib/character/CustomizableCharacter";
import { TimeConfig } from "@/lib/types/character";
import type { CharacterAppearance } from "@/lib/character/useCharacterModel";

export interface CharacterCreatorProps {
  modelPath: string;
  animationsPath: string;
  appearance: CharacterAppearance;
  cameraPosition: [number, number, number];
  focusPosition: [number, number, number];
  rotation: [number, number, number];
  timeConfig: TimeConfig;
  inputManager: CharacterInputManager;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto" />
        <p className="text-sm text-neutral-300">Cargando personaje...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="text-red-500 text-5xl">⚠️</div>
        <h3 className="text-lg font-semibold text-white">Error al cargar el personaje</h3>
        <p className="text-sm text-neutral-300">{error}</p>
      </div>
    </div>
  );
}

export function CharacterCreator({
  modelPath,
  animationsPath,
  appearance,
  cameraPosition,
  focusPosition,
  rotation,
  timeConfig,
  onLoad,
}: CharacterCreatorProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleCharacterLoad = useCallback(() => {
    console.log('✅ Personaje cargado completamente');
    setLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleCharacterError = useCallback((error: string) => {
    console.error('❌ Error en CharacterCreator:', error);
    setLoading(false);
    setLoadError(error);
  }, []);

  const targetPosition = new THREE.Vector3(...focusPosition);

  return (
    <div
      className="relative w-full h-full"
      style={{
        background: timeConfig.skyColor.includes("gradient")
          ? timeConfig.skyColor
          : timeConfig.skyColor,
      }}
    >
      {loading && <LoadingScreen />}
      {loadError && <ErrorScreen error={loadError} />}

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
          <ambientLight color={timeConfig.ambientLightColor} intensity={0.8} />
          <directionalLight
            color={timeConfig.sunLightColor}
            intensity={1}
            position={[10, 10, 10]}
          />
          <spotLight
            color={timeConfig.frontLightColor}
            intensity={30}
            position={[5, 5, 5]}
            angle={0.5}
            penumbra={0.5}
          />

          <CustomizableCharacter
            modelPath={modelPath}
            animationsPath={animationsPath}
            appearance={appearance}
            rotation={rotation}
            onLoad={handleCharacterLoad}
            onError={handleCharacterError}
            autoRestartIdle={true}
          />

          <OrbitControls
            target={targetPosition}
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={5}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export type { CharacterAppearance };
