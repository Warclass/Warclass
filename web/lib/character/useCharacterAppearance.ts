/**
 * Custom Hook para manejar actualizaciones de apariencia del personaje
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { CharacterAppearance, applyAppearanceToMaterials } from './useCharacterModel';

interface UseCharacterAppearanceOptions {
  materialsMap: Map<string, THREE.Material>;
  appearance: CharacterAppearance;
  enabled?: boolean;
}

/**
 * Hook para actualizar la apariencia del personaje sin recargar el modelo
 */
export function useCharacterAppearance({
  materialsMap,
  appearance,
  enabled = true,
}: UseCharacterAppearanceOptions): void {
  useEffect(() => {
    if (!enabled || materialsMap.size === 0) return;

    console.log('🎨 Actualizando apariencia del personaje');
    applyAppearanceToMaterials(materialsMap, appearance);
  }, [appearance, materialsMap, enabled]);
}
