/**
 * Custom Hook para manejar la carga y gestión de modelos de personajes
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { AnimationManager } from './AnimationManager';

export interface CharacterAppearance {
  Hair?: string;
  Eyes?: string;
  Skin?: string;
  Shirt?: string;
  Pants?: string;
  Shoes?: string;
}

interface UseCharacterModelOptions {
  modelPath: string;
  animationsPath: string;
  appearance: CharacterAppearance;
  rotation: [number, number, number];
  onLoad?: () => void;
  onError?: (error: string) => void;
}

interface UseCharacterModelReturn {
  groupRef: React.RefObject<THREE.Group | null>;
  modelRef: React.RefObject<THREE.Group | null>;
  animationManagerRef: React.RefObject<AnimationManager | null>;
  materialsMap: Map<string, THREE.Material>;
  modelLoaded: boolean;
  loadError: string | null;
}

export function useCharacterModel({
  modelPath,
  animationsPath,
  appearance,
  rotation,
  onLoad,
  onError,
}: UseCharacterModelOptions): UseCharacterModelReturn {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationManagerRef = useRef<AnimationManager | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Map<string, THREE.Material>>(new Map());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const isInitialLoadRef = useRef(false);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  // Actualizar refs de callbacks
  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  // Cleanup al desmontar
  useEffect(() => {
    console.log('🟢 useCharacterModel MONTADO');
    return () => {
      console.log('🔴 useCharacterModel DESMONTADO');
      if (animationManagerRef.current) {
        console.log('🧹 Limpiando AnimationManager');
        animationManagerRef.current.dispose();
        animationManagerRef.current = null;
      }
    };
  }, []);

  // Cargar modelo
  useEffect(() => {
    // Si ya cargamos, verificar animación
    if (isInitialLoadRef.current && modelRef.current && animationManagerRef.current) {
      console.log('⏭️ Modelo ya cargado, verificando animación idle');
      
      if (!animationManagerRef.current.isPlaying('idle')) {
        console.log('🔄 Reiniciando animación idle');
        animationManagerRef.current.play('idle');
      } else {
        console.log('✅ Animación idle ya está corriendo');
      }
      
      return;
    }

    console.log('🎨 Cargando modelo desde:', modelPath);
    isInitialLoadRef.current = true;
    setModelLoaded(false);
    const loader = new FBXLoader();

    loader.load(
      modelPath,
      (object) => {
        console.log('✅ Modelo cargado exitosamente');
        object.scale.set(0.005, 0.005, 0.005);
        object.rotation.set(...rotation);

        // Extraer materiales
        const materials = new Map<string, THREE.Material>();
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const meshMaterials = Array.isArray(child.material) 
              ? child.material 
              : [child.material];
            
            meshMaterials.forEach((mat) => {
              materials.set(mat.name, mat);
            });
          }
        });

        console.log("✅ Total de materiales mapeados:", materials.size);
        setMaterialsMap(materials);
        modelRef.current = object;

        // Aplicar colores iniciales
        applyAppearanceToMaterials(materials, appearance);

        // Agregar al grupo
        if (groupRef.current) {
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0]);
          }
          groupRef.current.add(object);
          console.log('✅ Modelo agregado al grupo');
        }

        // Crear AnimationManager
        animationManagerRef.current = new AnimationManager(object, animationsPath);

        // Cargar animaciones
        animationManagerRef.current
          .loadAnimations([{ name: "idle", path: "idle.fbx", loop: true }])
          .then(() => {
            console.log('✅ Animaciones cargadas');
            const action = animationManagerRef.current?.play("idle");
            if (action) {
              console.log('✅ Animación idle iniciada');
            }
            setModelLoaded(true);
            onLoadRef.current?.();
          })
          .catch((error) => {
            console.error('❌ Error cargando animaciones:', error);
            const errorMsg = `Error al cargar animaciones: ${error.message}`;
            setLoadError(errorMsg);
            onErrorRef.current?.(errorMsg);
          });
      },
      undefined,
      (error) => {
        console.error('❌ Error loading character:', error);
        const errorMsg = `Error al cargar el modelo: ${error instanceof Error ? error.message : 'Archivo no encontrado'}`;
        setLoadError(errorMsg);
        onErrorRef.current?.(errorMsg);
      }
    );
  }, [modelPath, animationsPath, rotation]);

  return {
    groupRef,
    modelRef,
    animationManagerRef,
    materialsMap,
    modelLoaded,
    loadError,
  };
}

/**
 * Aplica la apariencia a los materiales del modelo
 */
export function applyAppearanceToMaterials(
  materialsMap: Map<string, THREE.Material>,
  appearance: CharacterAppearance
): number {
  const materialMapping: Record<string, keyof CharacterAppearance> = {
    Hair: "Hair",
    "Hair.001": "Hair",
    Eye: "Eyes",
    Eyes: "Eyes",
    Skin: "Skin",
    Body: "Skin",
    Shirt: "Shirt",
    Top: "Shirt",
    "T-Shirt": "Shirt",
    Base_Chestplate: "Shirt",
    Accent_Chestplate: "Shirt",
    Pants: "Pants",
    Legs: "Pants",
    Base_Leggings: "Pants",
    Shoes: "Shoes",
    Boots: "Shoes",
    Base_Boots: "Shoes",
    Accent_Boots: "Shoes",
  };

  let updatedCount = 0;
  materialsMap.forEach((material, name) => {
    const appearanceKey = materialMapping[name];
    if (appearanceKey && appearance[appearanceKey]) {
      const hexColor = appearance[appearanceKey];
      if (
        material instanceof THREE.MeshStandardMaterial ||
        material instanceof THREE.MeshPhongMaterial ||
        material instanceof THREE.MeshBasicMaterial
      ) {
        material.color.set(new THREE.Color(hexColor));
        material.needsUpdate = true;
        updatedCount++;
      }
    }
  });

  if (updatedCount > 0) {
    console.log(`🎨 Colores aplicados: ${updatedCount} materiales`);
  }

  return updatedCount;
}
