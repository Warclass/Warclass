/**
 * Custom Hook para manejar actualizaciones de animaciones del personaje
 */

import { useFrame } from '@react-three/fiber';
import { AnimationManager } from './AnimationManager';

interface UseCharacterAnimationOptions {
  animationManager: AnimationManager | null;
  autoRestartIdle?: boolean;
  modelLoaded?: boolean;
}

/**
 * Hook para actualizar el mixer de animaciones y mantener idle corriendo
 */
export function useCharacterAnimation({
  animationManager,
  autoRestartIdle = true,
  modelLoaded = false,
}: UseCharacterAnimationOptions): void {
  useFrame((_, delta) => {
    if (!animationManager) return;

    animationManager.update(delta);

    // Auto-restart idle si se detiene
    if (autoRestartIdle && modelLoaded && !animationManager.isPlaying('idle')) {
      console.warn('⚠️ Animación idle detenida, reiniciando...');
      animationManager.play('idle');
    }
  });
}
