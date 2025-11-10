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
  public mixer: THREE.AnimationMixer; // Cambiado a public para acceso externo
  private animations: Map<AnimationName, AnimationClip>;
  private loader: FBXLoader;
  private basePath: string;

  constructor(model: THREE.Group, basePath: string) {
    console.log('🎭 Inicializando AnimationManager');
    this.mixer = new THREE.AnimationMixer(model);
    this.animations = new Map();
    this.loader = new FBXLoader();
    this.basePath = basePath;

    // Verificar que el modelo tenga skeleton
    let skeletonFound = false;
    model.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        skeletonFound = true;
        console.log('✅ Skeleton encontrado en el modelo:', {
          bones: child.skeleton.bones.length,
          meshName: child.name
        });
      }
    });

    if (!skeletonFound) {
      console.error('❌ No se encontró skeleton en el modelo - las animaciones no funcionarán');
    }
  }

  async loadAnimation(config: AnimationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const fullPath = `${this.basePath}${config.path}`;
      console.log(`🎬 Cargando animación "${config.name}" desde: ${fullPath}`);
      
      this.loader.load(
        fullPath,
        (fbx) => {
          const clip = fbx.animations[0];
          if (!clip) {
            console.error(`❌ No se encontró animación en ${config.path}`);
            reject(new Error(`No animation found in ${config.path}`));
            return;
          }

          console.log(`✅ Clip "${config.name}" cargado:`, {
            duration: clip.duration,
            name: clip.name,
            tracks: clip.tracks.length,
            trackNames: clip.tracks.slice(0, 5).map(t => t.name) // Mostrar primeros 5 tracks
          });

          const action = this.mixer.clipAction(clip);

          console.log('🎬 Action creada:', {
            enabled: action.enabled,
            paused: action.paused,
            time: action.time,
            timeScale: action.timeScale,
            weight: action.weight
          });

          // Configurar loop
          if (config.loop === false) {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            console.log(`🔁 Loop desactivado para "${config.name}"`);
          } else {
            action.setLoop(THREE.LoopRepeat, Infinity);
            console.log(`🔁 Loop activado para "${config.name}"`);
          }

          if (config.timeScale) {
            action.setEffectiveTimeScale(config.timeScale);
          }

          this.animations.set(config.name, { clip, action });
          console.log(`✅ Animación "${config.name}" registrada en el manager`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`❌ Error cargando ${fullPath}:`, error);
          reject(error);
        }
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
      console.warn(`❌ Animación "${name}" no encontrada en el manager`);
      return null;
    }

    console.log(`▶️ Reproduciendo animación "${name}"`);

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

    console.log(`✅ Animación "${name}" reproduciendo:`, {
      enabled: action.enabled,
      time: action.time,
      timeScale: action.getEffectiveTimeScale(),
      weight: action.getEffectiveWeight(),
      isRunning: action.isRunning(),
      paused: action.paused
    });

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
