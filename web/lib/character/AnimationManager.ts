/**
 * Animation Manager
 * Factory para manejo centralizado de animaciones
 */

import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  AnimationName,
  AnimationClip,
  AnimationConfig,
} from "@/lib/types/character";

export class AnimationManager {
  private mixer: THREE.AnimationMixer;
  private animations: Map<AnimationName, AnimationClip>;
  private loader: FBXLoader;
  private basePath: string;

  constructor(model: THREE.Group, basePath: string) {
    this.mixer = new THREE.AnimationMixer(model);
    this.animations = new Map();
    this.loader = new FBXLoader();
    this.basePath = basePath;
  }

  async loadAnimation(config: AnimationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        `${this.basePath}${config.path}`,
        (fbx) => {
          const clip = fbx.animations[0];
          if (!clip) {
            reject(new Error(`No animation found in ${config.path}`));
            return;
          }

          const action = this.mixer.clipAction(clip);

          if (config.loop === false) {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
          }

          if (config.timeScale) {
            action.setEffectiveTimeScale(config.timeScale);
          }

          this.animations.set(config.name, { clip, action });
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  async loadAnimations(configs: AnimationConfig[]): Promise<void> {
    await Promise.all(configs.map((config) => this.loadAnimation(config)));
  }

  getAnimation(name: AnimationName): AnimationClip | undefined {
    return this.animations.get(name);
  }

  play(
    name: AnimationName,
    options: {
      crossfadeDuration?: number;
      timeScale?: number;
      resetTime?: boolean;
    } = {}
  ): THREE.AnimationAction | null {
    const animationClip = this.animations.get(name);
    if (!animationClip) {
      console.warn(`Animation "${name}" not found`);
      return null;
    }

    const { action } = animationClip;
    const {
      crossfadeDuration = 0.5,
      timeScale = 1.0,
      resetTime = true,
    } = options;

    if (crossfadeDuration > 0) {
      this.animations.forEach((anim, animName) => {
        if (animName !== name && anim.action.isRunning()) {
          action.crossFadeFrom(anim.action, crossfadeDuration, true);
        }
      });
    }

    action.enabled = true;
    if (resetTime) {
      action.time = 0.0;
    }
    action.setEffectiveTimeScale(timeScale);
    action.setEffectiveWeight(1.0);
    action.play();

    return action;
  }

  stop(name: AnimationName, fadeDuration: number = 0): void {
    const animationClip = this.animations.get(name);
    if (!animationClip) return;

    const { action } = animationClip;
    
    if (fadeDuration > 0) {
      action.fadeOut(fadeDuration);
    } else {
      action.stop();
    }
  }

  stopAll(fadeDuration: number = 0): void {
    this.animations.forEach((_, name) => {
      this.stop(name, fadeDuration);
    });
  }

  isPlaying(name: AnimationName): boolean {
    const animationClip = this.animations.get(name);
    return animationClip?.action.isRunning() ?? false;
  }

  getTime(name: AnimationName): number {
    const animationClip = this.animations.get(name);
    return animationClip?.action.time ?? 0;
  }

  getDuration(name: AnimationName): number {
    const animationClip = this.animations.get(name);
    return animationClip?.clip.duration ?? 0;
  }

  isFinished(name: AnimationName): boolean {
    const animationClip = this.animations.get(name);
    if (!animationClip) return false;

    const { action, clip } = animationClip;
    return action.time >= clip.duration - 0.1;
  }

  update(deltaTime: number): void {
    this.mixer.update(deltaTime);
  }

  getAllAnimations(): Record<AnimationName, AnimationClip> {
    const result: Partial<Record<AnimationName, AnimationClip>> = {};
    this.animations.forEach((clip, name) => {
      result[name] = clip;
    });
    return result as Record<AnimationName, AnimationClip>;
  }

  dispose(): void {
    this.stopAll();
    this.animations.clear();
  }
}
