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
}

function CustomizableCharacter({
  modelPath,
  animationsPath,
  appearance,
  rotation,
  onLoad,
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

  useEffect(() => {
    const loader = new FBXLoader();

    loader.load(
      modelPath,
      (object) => {
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

        if (groupRef.current && !groupRef.current.children.length) {
          groupRef.current.add(object);
        }

        animationManagerRef.current = new AnimationManager(
          object,
          animationsPath
        );

        animationManagerRef.current
          .loadAnimations([{ name: "idle", path: "idle.fbx", loop: true }])
          .then(() => {
            animationManagerRef.current?.play("idle");
            onLoad?.();
          });
      },
      undefined,
      (error) => console.error("Error loading character:", error)
    );

    return () => {
      animationManagerRef.current?.dispose();
    };
  }, [modelPath, animationsPath, rotation, onLoad]);

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

  const handleCharacterLoad = () => {
    setLoading(false);
    onLoad?.();
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
