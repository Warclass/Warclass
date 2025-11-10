/**
 * Componente de personaje customizable reutilizable
 */

"use client";

import { useState, useEffect } from 'react';
import { useCharacterModel } from './useCharacterModel';
import { useCharacterAppearance } from './useCharacterAppearance';
import { useCharacterAnimation } from './useCharacterAnimation';
import type { CharacterAppearance } from './useCharacterModel';

export interface CustomizableCharacterProps {
  modelPath: string;
  animationsPath: string;
  appearance: CharacterAppearance;
  rotation?: [number, number, number];
  scale?: number;
  onLoad?: () => void;
  onError?: (error: string) => void;
  autoRestartIdle?: boolean;
}

/**
 * Componente de personaje 3D customizable
 * Se renderiza dentro de un Canvas de R3F
 */
export function CustomizableCharacter({
  modelPath,
  animationsPath,
  appearance,
  rotation = [0, 0, 0],
  onLoad,
  onError,
  autoRestartIdle = true,
}: CustomizableCharacterProps) {
  const [wasLoadedOnce, setWasLoadedOnce] = useState(false);

  // Hook principal para cargar el modelo
  const {
    groupRef,
    animationManagerRef,
    materialsMap,
    modelLoaded,
    loadError,
  } = useCharacterModel({
    modelPath,
    animationsPath,
    appearance,
    rotation,
    onLoad,
    onError,
  });

  // Hook para actualizar colores dinámicamente
  useCharacterAppearance({
    materialsMap,
    appearance,
    enabled: modelLoaded,
  });

  // Hook para mantener la animación corriendo
  useCharacterAnimation({
    animationManager: animationManagerRef.current,
    autoRestartIdle,
    modelLoaded,
  });

  // Marcar como cargado una vez
  useEffect(() => {
    if (modelLoaded && !wasLoadedOnce) {
      setWasLoadedOnce(true);
      console.log('✅ Personaje visible permanentemente');
    }
  }, [modelLoaded, wasLoadedOnce]);

  // Mostrar error si hay
  if (loadError) {
    console.error('❌ Error en CustomizableCharacter:', loadError);
  }

  // Solo visible después de la primera carga
  return <group ref={groupRef} visible={wasLoadedOnce || modelLoaded} />;
}

export type { CharacterAppearance };
