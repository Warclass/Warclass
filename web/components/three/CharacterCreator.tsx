/**
 * Character Creator Component
 * Versión extendida de CharacterScene con personalización de apariencia
 */

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
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

  useEffect(() => {
    console.log('🎨 Cargando modelo desde:', modelPath);
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
            onLoad?.();
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
            onLoad?.();
          })
          .catch((error) => {
            console.error('❌ Error cargando animaciones:', error);
            const errorMsg = `Error al cargar animaciones: ${error.message}`;
            setLoadError(errorMsg);
            onError?.(errorMsg);
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
        onError?.(errorMsg);
      }
    );

    return () => {
      animationManagerRef.current?.dispose();
    };
  }, [modelPath, animationsPath, rotation, onLoad, onError]);

  useEffect(() => {
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
          const newColor = new THREE.Color(hexColor);
          material.color.set(newColor);
          material.needsUpdate = true;
          updatedCount++;
          console.log(
            `✅ Material "${name}" actualizado a ${hexColor} (RGB: ${material.color.r.toFixed(
              2
            )}, ${material.color.g.toFixed(2)}, ${material.color.b.toFixed(2)})`
          );
        } else {
          console.log(
            `⚠️ Material "${name}" no es un tipo compatible:`,
            material.type
          );
        }
      } else if (appearanceKey) {
        console.log(
          `⚠️ No se encontró color para "${name}" → ${appearanceKey}`
        );
      }
    });

    console.log(
      `🔄 Total de materiales actualizados: ${updatedCount}/${materialsMap.size}`
    );
  }, [appearance, materialsMap]);

  useFrame((_, delta) => {
    if (animationManagerRef.current) {
      animationManagerRef.current.update(delta);
      
      // Log periódico para debugging (cada 60 frames aprox)
      if (Math.random() < 0.016) {
        const isIdle = animationManagerRef.current.isPlaying('idle');
        console.log('🔄 Frame update:', {
          delta,
          idlePlaying: isIdle,
          idleTime: animationManagerRef.current.getTime('idle'),
          idleDuration: animationManagerRef.current.getDuration('idle')
        });
      }
    }
  });

  return <group ref={groupRef} />;
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

  const handleCharacterLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleCharacterError = (error: string) => {
    console.error('❌ Error en CharacterCreator:', error);
    setLoading(false);
    setLoadError(error);
  };

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
