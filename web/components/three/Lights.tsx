/**
 * Lights Component
 * Sistema de iluminación three-point para el personaje
 */

"use client";

import * as THREE from "three";
import { LightsConfig, TimeConfig } from "@/lib/types/character";

interface LightsProps {
  lightsConfig: LightsConfig;
  timeConfig: TimeConfig;
  targetPosition: THREE.Vector3;
  characterSize: THREE.Vector3;
  helpers?: boolean;
}

export function CharacterLights({
  lightsConfig,
  timeConfig,
  targetPosition,
  characterSize,
  helpers = false,
}: LightsProps) {
  const distance = characterSize.y * 2;

  const getPosition = (angle: number) => {
    const lightAngle = angle * (Math.PI / 180);
    return new THREE.Vector3(
      targetPosition.x +
        (targetPosition.x ? Math.sign(targetPosition.x) : 1) *
          distance *
          Math.sin(lightAngle),
      targetPosition.y + distance / 2.9,
      targetPosition.z +
        (targetPosition.z ? Math.sign(targetPosition.z) : 1) *
          distance *
          Math.cos(lightAngle)
    );
  };

  const keyPosition = getPosition(64 + lightsConfig.frontLight.modifier);
  const fillPosition = getPosition(100 + lightsConfig.frontLight.modifier);

  return (
    <>
      <ambientLight color={timeConfig.ambientLightColor} intensity={0.125} />

      <spotLight
        color={timeConfig.frontLightColor}
        intensity={40}
        distance={(9 / 8) * distance}
        angle={distance / 7}
        position={[keyPosition.x, keyPosition.y, keyPosition.z]}
        target-position={[targetPosition.x, targetPosition.y, targetPosition.z]}
        castShadow
      />

      <spotLight
        color={timeConfig.frontLightColor}
        intensity={20}
        distance={(9 / 8) * distance}
        angle={distance / 7}
        position={[fillPosition.x, fillPosition.y, fillPosition.z]}
        target-position={[targetPosition.x, targetPosition.y, targetPosition.z]}
        castShadow
      />

      <directionalLight
        color={timeConfig.sunLightColor}
        intensity={1}
        position={[
          lightsConfig.backLight.position.x,
          lightsConfig.backLight.position.y,
          lightsConfig.backLight.position.z,
        ]}
        target-position={[5, 0, -5]}
      />

      {helpers && (
        <>
          <axesHelper args={[5]} />
          <gridHelper args={[10, 10]} />
        </>
      )}
    </>
  );
}
