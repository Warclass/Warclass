/**
 * Character Model Component
 * Componente R3F para renderizar y controlar el personaje
 */

"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterControllerImpl } from "@/lib/character/CharacterController";
import { CharacterInputManager } from "@/lib/character/InputManager";

interface CharacterProps {
  modelPath: string;
  animationsPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  inputManager: CharacterInputManager;
  onLoad?: (model: THREE.Group) => void;
}

export function Character({
  modelPath,
  animationsPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.005,
  inputManager,
  onLoad,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<CharacterControllerImpl | null>(null);

  useEffect(() => {
    const controller = new CharacterControllerImpl(
      {
        modelPath,
        animationsPath,
        position: new THREE.Vector3(...position),
        rotation: new THREE.Euler(...rotation),
        scale,
      },
      inputManager
    );

    controllerRef.current = controller;

    controller.getModel().then((model) => {
      if (groupRef.current && !groupRef.current.children.length) {
        groupRef.current.add(model);
        onLoad?.(model);
      }
    });

    return () => {
      controller.dispose();
    };
  }, [
    modelPath,
    animationsPath,
    position,
    rotation,
    scale,
    inputManager,
    onLoad,
  ]);

  useFrame((_, delta) => {
    if (controllerRef.current) {
      controllerRef.current.update(delta);
    }
  });

  return <group ref={groupRef} />;
}
