/**
 * Finite State Machine (FSM) - Versión Mejorada
 * Sistema robusto de máquina de estados con validación de transiciones
 */

import {
  StateName,
  StateConfig,
  FSMConfig,
  StateTransition,
  FSMState,
} from "@/lib/types/character";
import { AnimationManager } from "./AnimationManager";

class State {
  protected parent: CharacterFSM;
  protected config: StateConfig;

  constructor(parent: CharacterFSM, config: StateConfig) {
    this.parent = parent;
    this.config = config;
  }

  get name(): StateName {
    return "idle";
  }

  enter(prevState: State | null): void {
    this.parent.animationManager.play(this.config.animation, {
      crossfadeDuration: 0.5,
      resetTime: true,
    });

    this.config.onEnter?.();

    if (this.parent.debug) {
      console.log(
        `[FSM] Entered state: ${this.name}`,
        prevState ? `from ${prevState.name}` : ""
      );
    }
  }

  exit(): void {
    this.config.onExit?.();

    if (this.parent.debug) {
      console.log(`[FSM] Exited state: ${this.name}`);
    }
  }

  update(): void {
    if (this.config.duration !== undefined) {
      const isFinished = this.parent.animationManager.isFinished(
        this.config.animation
      );

      if (isFinished) {
        this.onComplete();
      }
    }
  }

  protected onComplete(): void {
    this.config.onComplete?.();
  }
}

class IdleState extends State {
  get name(): StateName {
    return "idle";
  }
}

class AcceptState extends State {
  get name(): StateName {
    return "accept";
  }

  protected onComplete(): void {
    super.onComplete();
    this.parent.transition("idle");
  }
}

class RejectState extends State {
  get name(): StateName {
    return "reject";
  }

  protected onComplete(): void {
    super.onComplete();
    this.parent.transition("idle");
  }
}

export class CharacterFSM implements FSMState {
  private states: Map<StateName, State>;
  private _currentState: State | null = null;
  private _previousState: State | null = null;
  private _isTransitioning: boolean = false;
  private config: FSMConfig;
  public animationManager: AnimationManager;
  public debug: boolean;
  private stateChangeCallback?: (transition: StateTransition) => void;

  constructor(animationManager: AnimationManager, config: FSMConfig) {
    this.animationManager = animationManager;
    this.config = config;
    this.debug = config.debug ?? false;
    this.stateChangeCallback = config.onStateChange;
    this.states = new Map();

    this.registerStates();

    this.transition(config.initialState);
  }

  private registerStates(): void {
    const stateClasses: Record<StateName, typeof State> = {
      idle: IdleState,
      accept: AcceptState,
      reject: RejectState,
    };

    Object.entries(this.config.states).forEach(([name, config]) => {
      const StateClass = stateClasses[name as StateName];
      if (StateClass) {
        const state = new StateClass(this, config);
        this.states.set(name as StateName, state);
      }
    });

    if (this.debug) {
      console.log(
        `[FSM] Registered ${this.states.size} states:`,
        Array.from(this.states.keys())
      );
    }
  }

  get currentState(): StateName {
    return this._currentState?.name ?? this.config.initialState;
  }

  get previousState(): StateName | null {
    return this._previousState?.name ?? null;
  }

  get isTransitioning(): boolean {
    return this._isTransitioning;
  }

  canTransition(to: StateName): boolean {
    if (!this._currentState) return true;

    const currentConfig = this.config.states[this._currentState.name];
    return currentConfig.canTransitionTo.includes(to);
  }

  transition(to: StateName): boolean {
    const newState = this.states.get(to);
    if (!newState) {
      console.error(`[FSM] State "${to}" does not exist`);
      return false;
    }

    if (this._currentState && !this.canTransition(to)) {
      if (this.debug) {
        console.warn(
          `[FSM] Cannot transition from "${this._currentState.name}" to "${to}"`
        );
      }
      return false;
    }

    if (this._currentState?.name === to) {
      if (this.debug) {
        console.log(`[FSM] Already in state "${to}"`);
      }
      return false;
    }

    this._isTransitioning = true;

    if (this._currentState) {
      this._currentState.exit();
      this._previousState = this._currentState;
    }

    this._currentState = newState;
    this._currentState.enter(this._previousState);

    this.stateChangeCallback?.({
      from: this._previousState?.name ?? this.config.initialState,
      to,
      timestamp: Date.now(),
    });

    this._isTransitioning = false;

    return true;
  }

  update(): void {
    if (this._currentState && !this._isTransitioning) {
      this._currentState.update();
    }
  }

  getStateConfig(state: StateName): StateConfig | undefined {
    return this.config.states[state];
  }

  getAvailableStates(): StateName[] {
    return Array.from(this.states.keys());
  }

  getAvailableTransitions(): StateName[] {
    if (!this._currentState) return [];
    return this.config.states[this._currentState.name].canTransitionTo;
  }

  reset(): void {
    this.transition(this.config.initialState);
  }

  dispose(): void {
    if (this._currentState) {
      this._currentState.exit();
    }

    this.states.clear();
    this._currentState = null;
    this._previousState = null;
  }
}
