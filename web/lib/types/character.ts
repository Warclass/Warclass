/**
 * Character Types & Interfaces
 **/

import * as THREE from "three";

export type AnimationName = "idle" | "accept" | "reject" | "walk" | "run";

export interface AnimationClip {
  clip: THREE.AnimationClip;
  action: THREE.AnimationAction;
}

export interface AnimationConfig {
  name: AnimationName;
  path: string;
  loop?: boolean;
  timeScale?: number;
}

export type StateName = "idle" | "accept" | "reject";

export interface StateConfig {
  name: StateName;
  animation: AnimationName;
  canTransitionTo: StateName[];
  duration?: number; // undefined = loop infinito
  onEnter?: () => void;
  onExit?: () => void;
  onComplete?: () => void;
}

export interface CharacterInput {
  accept: boolean;
  reject: boolean;
  focus: boolean;
}

export type InputEvent = "accept" | "reject" | "focus" | "blur";

export interface InputHandler {
  getState: () => CharacterInput;
  on: (event: InputEvent, callback: () => void) => void;
  off: (event: InputEvent, callback: () => void) => void;
  reset: () => void;
}

export interface StateTransition {
  from: StateName;
  to: StateName;
  timestamp: number;
}

export interface FSMConfig {
  initialState: StateName;
  states: Record<StateName, StateConfig>;
  onStateChange?: (transition: StateTransition) => void;
  debug?: boolean;
}

export interface FSMState {
  currentState: StateName;
  previousState: StateName | null;
  isTransitioning: boolean;
  canTransition: (to: StateName) => boolean;
  transition: (to: StateName) => void;
}

export interface CharacterConfig {
  modelPath: string;
  animationsPath: string;
  position?: THREE.Vector3;
  scale?: number;
  rotation?: THREE.Euler;
}

export interface CharacterController {
  model: THREE.Group | null;
  animations: Record<AnimationName, AnimationClip>;
  fsm: FSMState;
  update: (deltaTime: number) => void;
  getModel: () => Promise<THREE.Group>;
}

export type AmbienceName =
  | "Ambience1"
  | "Ambience2"
  | "Ambience3"
  | "Ambience4"
  | "Ambience5";

export interface AmbienceConfig {
  name: AmbienceName;
  focusPosition: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  characterRotation: THREE.Euler;
  models: Array<{
    path: string;
    scale?: number;
    position?: THREE.Vector3;
  }>;
  lights: LightsConfig;
  time: TimeOfDay;
}

export type TimeOfDay = "day" | "night" | "dawn" | "dusk";

export interface LightsConfig {
  frontLight: {
    modifier: number;
  };
  backLight: {
    position: THREE.Vector3;
  };
}

export interface TimeConfig {
  exposure: number;
  skyColor: string;
  ambientLightColor: string | number;
  frontLightColor: string | number;
  sunLightColor: string | number;
}

export interface SceneConfig {
  characterId: number;
  ambience: AmbienceConfig;
  timeConfig: TimeConfig;
}
