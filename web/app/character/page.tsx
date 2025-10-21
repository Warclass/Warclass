/**
 * Character Page Example
 */

"use client";

import { useEffect, useState } from "react";
import { CharacterScene } from "@/components/three/CharacterScene";
import * as THREE from "three";
import { AmbienceName, TimeConfig } from "@/lib/types/character";

const MOCK_AMBIENCE_CONFIG = {
  Ambience1: {
    focusPosition: new THREE.Vector3(0, 0, 0),
    cameraPosition: new THREE.Vector3(0, 5, 10),
    characterRotation: new THREE.Euler(0, (3 / 4) * Math.PI, 0),
    lights: {
      frontLight: { modifier: 0 },
      backLight: { position: new THREE.Vector3(10, 10, 10) },
    },
    time: "day" as const,
  },
};

const MOCK_TIME_CONFIG: Record<string, TimeConfig> = {
  day: {
    exposure: 2.7,
    skyColor: "#87CEEB",
    ambientLightColor: 0xffffff,
    frontLightColor: 0xffffff,
    sunLightColor: 0xffffee,
  },
  night: {
    exposure: 1.5,
    skyColor: "#1a1a2e",
    ambientLightColor: 0x4a4a6a,
    frontLightColor: 0x8888cc,
    sunLightColor: 0xaaaaee,
  },
};

export default function CharacterPage() {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Inicializando escena...</p>
        </div>
      </div>
    );
  }

  const ambienceName: AmbienceName = "Ambience1";
  const ambienceConfig = MOCK_AMBIENCE_CONFIG[ambienceName];
  const timeConfig = MOCK_TIME_CONFIG[ambienceConfig.time];

  return (
    <div className="w-screen h-screen">
      <CharacterScene
        characterId={1}
        ambienceName={ambienceName}
        timeConfig={timeConfig}
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
        characterRotation={[
          ambienceConfig.characterRotation.x,
          ambienceConfig.characterRotation.y,
          ambienceConfig.characterRotation.z,
        ]}
        lightsConfig={ambienceConfig.lights}
        onLoad={() => {
          console.log("[App] Character scene loaded!");
        }}
      />
    </div>
  );
}
