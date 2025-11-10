/**
 * Utilidades para manejo de apariencia de personajes
 * Funciones helper para aplicar colores a materiales de Three.js
 */

import * as THREE from 'three';
import type { CharacterAppearance } from './useCharacterModel';

/**
 * Mapa de nombres de materiales a claves de apariencia
 */
const MATERIAL_MAPPING: Record<string, keyof CharacterAppearance> = {
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

/**
 * Aplica los colores de apariencia a los materiales del modelo
 * @param materialsMap Mapa de materiales extraídos del modelo
 * @param appearance Configuración de apariencia con colores hex
 * @returns Número de materiales actualizados
 */
export function applyAppearanceToMaterials(
  materialsMap: Map<string, THREE.Material>,
  appearance: CharacterAppearance
): number {
  let updatedCount = 0;

  materialsMap.forEach((material, name) => {
    const appearanceKey = MATERIAL_MAPPING[name];
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
        console.log(`🎨 Color aplicado: ${name} → ${hexColor}`);
      }
    }
  });

  return updatedCount;
}

/**
 * Extrae todos los materiales de un modelo Three.js
 * @param model Modelo Three.js (Group o Object3D)
 * @returns Mapa de materiales por nombre
 */
export function extractMaterialsFromModel(model: THREE.Object3D): Map<string, THREE.Material> {
  const materials = new Map<string, THREE.Material>();

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          materials.set(mat.name, mat);
        });
      } else {
        materials.set(child.material.name, child.material);
      }
    }
  });

  return materials;
}
