/**
 * Character System Index
 * Exportaciones principales del sistema de personaje
 */

// Managers y Controladores (clases existentes)
export { CharacterInputManager } from "./InputManager";
export { AnimationManager } from "./AnimationManager";
export { CharacterFSM } from "./FSM";
export { CharacterControllerImpl as CharacterController } from "./CharacterController";

// Hooks de React para UI
export { useCharacterModel } from './useCharacterModel';
export { useCharacterAppearance } from './useCharacterAppearance';
export { useCharacterAnimation } from './useCharacterAnimation';

// Componentes
export { CustomizableCharacter } from './CustomizableCharacter';

// Utilidades
export { applyAppearanceToMaterials, extractMaterialsFromModel } from './appearance-utils';

// Types
export type { CharacterAppearance } from './useCharacterModel';
export type { CustomizableCharacterProps } from './CustomizableCharacter';
