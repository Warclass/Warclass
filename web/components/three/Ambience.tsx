/**
 * Ambience Component
 * Carga y renderiza los modelos de ambiente
 */

"use client";

import { useEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AmbienceName } from "@/lib/types/character";

interface AmbienceModel {
  path: string;
  scale?: number;
  position?: [number, number, number];
}

interface AmbienceProps {
  name: AmbienceName;
}

const AMBIENCE_CONFIGS: Record<AmbienceName, AmbienceModel[]> = {
  Ambience1: [
    {
      path: "/models/character_scene/Ambience/Ambience1/bg1_optimized.glb",
      scale: 1,
      position: [0, 0, 0],
    },
    {
      path: "/models/character_scene/Ambience/Ambience1/lake.glb",
      scale: 1,
      position: [5, -0.45, -2.5],
    },
  ],
  Ambience2: [
    {
      path: "/models/character_scene/Ambience/Ambience2/Waterfall_scene.glb",
      scale: 2.5,
      position: [0, 0, 0],
    },
  ],
  Ambience3: [
    {
      path: "/models/character_scene/Ambience/Ambience3/Desert.glb",
      scale: 0.05,
      position: [0, 0, 0],
    },
  ],
  Ambience4: [
    {
      path: "/models/character_scene/Ambience/Ambience4/Forest_scene_optimized.glb",
      scale: 5,
      position: [0, 0, 0],
    },
  ],
  Ambience5: [
    {
      path: "/models/character_scene/Ambience/Ambience5/Swamp Island.glb",
      scale: 5,
      position: [0, 0, 0],
    },
  ],
};

function AmbienceModel({
  path,
  scale = 1,
  position = [0, 0, 0],
}: AmbienceModel) {
  const gltf = useLoader(GLTFLoader, path);

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
    }
  }, [gltf]);

  return (
    <primitive
      object={gltf.scene}
      scale={[scale, scale, scale]}
      position={position}
    />
  );
}

export function Ambience({ name }: AmbienceProps) {
  const [models, setModels] = useState<AmbienceModel[]>([]);

  useEffect(() => {
    const config = AMBIENCE_CONFIGS[name];
    if (config) {
      setModels(config);
    }
  }, [name]);

  return (
    <>
      {models.map((model, index) => (
        <AmbienceModel key={`${name}-${index}`} {...model} />
      ))}
    </>
  );
}
