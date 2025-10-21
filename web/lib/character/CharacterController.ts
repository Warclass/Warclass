/**
 * Character Controller
 */

import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  CharacterConfig,
  CharacterController,
  AnimationName,
  AnimationClip,
  StateName,
  StateConfig,
} from "@/lib/types/character";
import { AnimationManager } from "./AnimationManager";
import { CharacterFSM } from "./FSM";
import { CharacterInputManager } from "./InputManager";

const CHARACTER_STATES: Record<StateName, StateConfig> = {
  idle: {
    name: "idle",
    animation: "idle",
    canTransitionTo: ["accept", "reject"],
  },
  accept: {
    name: "accept",
    animation: "accept",
    canTransitionTo: ["idle"],
    duration: 2.0,
  },
  reject: {
    name: "reject",
    animation: "reject",
    canTransitionTo: ["idle"],
    duration: 2.0,
  },
};

export class CharacterControllerImpl implements CharacterController {
  public model: THREE.Group | null = null;
  public animations: Record<AnimationName, AnimationClip> = {} as Record<
    AnimationName,
    AnimationClip
  >;
  public fsm!: CharacterFSM;

  private config: CharacterConfig;
  private animationManager!: AnimationManager;
  private inputManager: CharacterInputManager;
  private modelLoadPromise: Promise<THREE.Group>;

  private velocity: THREE.Vector3;
  private acceleration: THREE.Vector3;
  private deceleration: THREE.Vector3;

  constructor(config: CharacterConfig, inputManager: CharacterInputManager) {
    this.config = config;
    this.inputManager = inputManager;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this.deceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);

    this.modelLoadPromise = this.loadModel();

    this.initializeAfterLoad();
  }

  private async initializeAfterLoad() {
    await this.modelLoadPromise;

    await this.loadAnimations();

    this.initializeFSM();

    this.connectInputs();
  }

  private async loadModel(): Promise<THREE.Group> {
    const loader = new FBXLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        this.config.modelPath,
        (object) => {
          object.scale.multiplyScalar(this.config.scale ?? 0.005);

          if (this.config.position) {
            object.position.copy(this.config.position);
          }

          if (this.config.rotation) {
            object.rotation.copy(this.config.rotation);
          }

          object.traverse((child) => {
            if (child instanceof THREE.Mesh && Array.isArray(child.material)) {
              child.material.forEach((material) => {
                console.log("[Character] Material:", material.name);
              });
            }
          });

          this.model = object;

          this.animationManager = new AnimationManager(
            object,
            this.config.animationsPath
          );

          resolve(object);
        },
        undefined,
        reject
      );
    });
  }

  private async loadAnimations(): Promise<void> {
    await this.animationManager.loadAnimations([
      { name: "idle", path: "idle.fbx", loop: true },
      { name: "accept", path: "accept.fbx", loop: false },
      { name: "reject", path: "reject.fbx", loop: false },
    ]);

    CHARACTER_STATES.accept.duration =
      this.animationManager.getDuration("accept");
    CHARACTER_STATES.reject.duration =
      this.animationManager.getDuration("reject");

    this.animations = this.animationManager.getAllAnimations();

    console.log("[Character] Loaded animations:", Object.keys(this.animations));
  }

  private initializeFSM(): void {
    this.fsm = new CharacterFSM(this.animationManager, {
      initialState: "idle",
      states: CHARACTER_STATES,
      debug: true,
      onStateChange: (transition) => {
        console.log(
          `[FSM] State changed: ${transition.from} → ${transition.to}`
        );
      },
    });
  }

  private connectInputs(): void {
    this.inputManager.on("accept", () => {
      if (this.fsm.canTransition("accept")) {
        this.fsm.transition("accept");
        this.inputManager.resetInput("accept");
      }
    });

    this.inputManager.on("reject", () => {
      if (this.fsm.canTransition("reject")) {
        this.fsm.transition("reject");
        this.inputManager.resetInput("reject");
      }
    });
  }

  update(deltaTime: number): void {
    if (!this.model || !this.fsm) return;

    this.fsm.update();

    this.animationManager.update(deltaTime);

    this.updatePhysics(deltaTime);
  }

  private updatePhysics(deltaTime: number): void {
    if (!this.model) return;

    const frameDeceleration = this.velocity
      .clone()
      .multiply(this.deceleration)
      .multiplyScalar(deltaTime);

    frameDeceleration.z =
      Math.sign(frameDeceleration.z) *
      Math.min(Math.abs(frameDeceleration.z), Math.abs(this.velocity.z));

    this.velocity.add(frameDeceleration);

    const forward = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.model.quaternion)
      .normalize();

    const sideways = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(this.model.quaternion)
      .normalize();

    sideways.multiplyScalar(this.velocity.x * deltaTime);
    forward.multiplyScalar(this.velocity.z * deltaTime);

    this.model.position.add(forward).add(sideways);
  }

  async getModel(): Promise<THREE.Group> {
    return this.modelLoadPromise;
  }

  dispose(): void {
    this.fsm?.dispose();
    this.animationManager?.dispose();
    this.inputManager?.destroy();
  }
}
