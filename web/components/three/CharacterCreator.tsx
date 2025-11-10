/**
 * Character Creator Component
 * Versión extendida de CharacterScene con personalización de apariencia
 */

"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { CharacterInputManager } from "@/lib/character/InputManager";
import { AnimationManager } from "@/lib/character/AnimationManager";
import { TimeConfig } from "@/lib/types/character";

interface CharacterAppearance {
  Hair?: string;
  Eyes?: string;
  Skin?: string;
  Shirt?: string;
  Pants?: string;
  Shoes?: string;
}

interface CharacterCreatorProps {
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

function CustomizableCharacter({
  modelPath,
  animationsPath,
  appearance,
  rotation,
  onLoad,
  onError,
}: Omit<
  CharacterCreatorProps,
  "cameraPosition" | "focusPosition" | "timeConfig" | "inputManager"
>) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationManagerRef = useRef<AnimationManager | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Map<string, THREE.Material>>(
    new Map()
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false); // Nuevo estado
  const wasLoadedRef = useRef(false); // Para mantener el estado de carga
  const isInitialLoadRef = useRef(false);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  // Actualizar las refs cuando cambien los callbacks
  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  // Una vez cargado, siempre cargado
  useEffect(() => {
    if (modelLoaded && !wasLoadedRef.current) {
      wasLoadedRef.current = true;
      console.log('✅ Modelo marcado como cargado permanentemente');
    }
  }, [modelLoaded]);

  // useEffect para detectar montaje/desmontaje
  useEffect(() => {
    console.log('🟢 CustomizableCharacter MONTADO');
    return () => {
      console.log('🔴 CustomizableCharacter DESMONTADO');
      // Solo limpiar cuando el componente se desmonta completamente
      if (animationManagerRef.current) {
        console.log('🧹 Limpiando AnimationManager en desmontaje');
        animationManagerRef.current.dispose();
        animationManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Si ya cargamos el modelo, solo verificar que la animación siga corriendo
    if (isInitialLoadRef.current && modelRef.current && animationManagerRef.current) {
      console.log('⏭️ Modelo ya cargado, verificando animación idle');
      
      // Si la animación idle no está corriendo, reiniciarla
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
    setModelLoaded(false); // Ocultar mientras carga
    const loader = new FBXLoader();

    loader.load(
      modelPath,
      (object) => {
        console.log('✅ Modelo cargado exitosamente');
        console.log('📦 Animaciones en el FBX:', object.animations.length);
        if (object.animations.length > 0) {
          object.animations.forEach((clip, index) => {
            console.log(`  ${index + 1}. ${clip.name} - Duración: ${clip.duration}s - Tracks: ${clip.tracks.length}`);
          });
        }
        
        object.scale.set(0.005, 0.005, 0.005);
        object.rotation.set(...rotation);

        const materials = new Map<string, THREE.Material>();
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                console.log(
                  "📋 Material encontrado (array):",
                  mat.name,
                  "Tipo:",
                  mat.type
                );
                materials.set(mat.name, mat);
              });
            } else {
              console.log(
                "📋 Material encontrado:",
                child.material.name,
                "Tipo:",
                child.material.type
              );
              materials.set(child.material.name, child.material);
            }
          }
        });

        console.log("✅ Total de materiales mapeados:", materials.size);
        setMaterialsMap(materials);
        modelRef.current = object;

        // 🎨 Aplicar colores INMEDIATAMENTE antes de mostrar el modelo
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

        let initialColorCount = 0;
        materials.forEach((material, name) => {
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
              initialColorCount++;
              console.log(`🎨 Color inicial aplicado: ${name} → ${hexColor}`);
            }
          }
        });
        console.log(`✅ Colores iniciales aplicados: ${initialColorCount}/${materials.size}`);

        // Verificar que el modelo tenga SkinnedMesh
        let hasSkinnedMesh = false;
        object.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh) {
            hasSkinnedMesh = true;
            console.log('✅ SkinnedMesh encontrado:', child.name);
            console.log('   - Skeleton bones:', child.skeleton?.bones.length);
          }
        });

        if (!hasSkinnedMesh) {
          console.warn('⚠️ El modelo no tiene SkinnedMesh - las animaciones no funcionarán');
        }

        // PRIMERO agregar el modelo al grupo (importante para que el mixer funcione)
        if (groupRef.current) {
          if (groupRef.current.children.length > 0) {
            // Limpiar hijos anteriores
            while (groupRef.current.children.length > 0) {
              groupRef.current.remove(groupRef.current.children[0]);
            }
          }
          groupRef.current.add(object);
          console.log('✅ Modelo agregado al grupo de la escena');
        }

        // LUEGO crear el AnimationManager (después de que el modelo esté en la escena)
        animationManagerRef.current = new AnimationManager(
          object,
          animationsPath
        );

        // Si el modelo ya tiene animaciones embebidas, úsalas como respaldo
        if (object.animations && object.animations.length > 0) {
          console.log('🎬 El modelo tiene animaciones embebidas, intentando usarlas primero...');
          const embeddedIdleClip = object.animations.find(clip => 
            clip.name.toLowerCase().includes('idle') || 
            clip.name.toLowerCase().includes('t-pose') ||
            object.animations.length === 1
          );
          
          if (embeddedIdleClip) {
            console.log('✅ Usando animación embebida:', embeddedIdleClip.name);
            const action = animationManagerRef.current.mixer.clipAction(embeddedIdleClip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
            setModelLoaded(true); // Marcar como cargado
            onLoadRef.current?.();
            return;
          }
        }

        // Si no hay animaciones embebidas, cargar desde archivos externos
        animationManagerRef.current
          .loadAnimations([{ name: "idle", path: "idle.fbx", loop: true }])
          .then(() => {
            console.log('✅ Animaciones cargadas exitosamente');
            const action = animationManagerRef.current?.play("idle");
            if (action) {
              console.log('✅ Animación idle iniciada:', {
                isRunning: action.isRunning(),
                time: action.time,
                timeScale: action.timeScale,
                weight: action.weight,
                enabled: action.enabled
              });
            } else {
              console.error('❌ No se pudo iniciar la animación idle');
            }
            setModelLoaded(true); // Marcar como cargado
            onLoadRef.current?.();
          })
          .catch((error) => {
            console.error('❌ Error cargando animaciones:', error);
            const errorMsg = `Error al cargar animaciones: ${error.message}`;
            setLoadError(errorMsg);
            onErrorRef.current?.(errorMsg);
          });
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        if (percent % 25 === 0) { // Log cada 25%
          console.log(`📦 Progreso de carga: ${percent.toFixed(0)}%`);
        }
      },
      (error) => {
        console.error('❌ Error loading character:', error);
        const errorMessage = error instanceof Error ? error.message : 'Archivo no encontrado';
        const errorMsg = `Error al cargar el modelo: ${errorMessage}`;
        setLoadError(errorMsg);
        onErrorRef.current?.(errorMsg);
      }
    );

    // NO hay cleanup aquí - se maneja en el useEffect de montaje/desmontaje
  }, [modelPath, animationsPath, rotation]); // Eliminadas onLoad y onError de dependencias

  // useEffect para actualizar colores dinámicamente (sin recargar el modelo)
  useEffect(() => {
    console.log('🎨 useEffect de colores disparado', {
      materialsMapSize: materialsMap.size,
      modelLoaded,
      hasAnimationManager: !!animationManagerRef.current,
      isIdlePlaying: animationManagerRef.current?.isPlaying('idle')
    });
    
    if (materialsMap.size === 0) return;

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
      console.log(`🎨 Colores actualizados: ${updatedCount} materiales`);
    }
  }, [appearance, materialsMap]);

  useFrame((_, delta) => {
    if (animationManagerRef.current) {
      animationManagerRef.current.update(delta);
      
      // Verificar periódicamente que idle esté corriendo
      if (modelLoaded && !animationManagerRef.current.isPlaying('idle')) {
        console.warn('⚠️ Animación idle detenida, reiniciando...');
        animationManagerRef.current.play('idle');
      }
    }
  });

  // Solo renderizar el grupo si el modelo está completamente cargado y animado
  // Una vez visible, siempre visible
  return <group ref={groupRef} visible={wasLoadedRef.current || modelLoaded} />;
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
