/**
 * Input Manager
 * Sistema desacoplado de manejo de input para el personaje
 */

import {
  CharacterInput,
  InputEvent,
  InputHandler,
} from "@/lib/types/character";

export class CharacterInputManager implements InputHandler {
  private state: CharacterInput;
  private listeners: Map<InputEvent, Set<() => void>>;
  private buttonHandlers: Map<string, () => void>;

  constructor() {
    this.state = {
      accept: false,
      reject: false,
      focus: false,
    };

    this.listeners = new Map();
    this.buttonHandlers = new Map();

    Object.keys(this.state).forEach((event) => {
      this.listeners.set(event as InputEvent, new Set());
    });
    this.listeners.set("blur", new Set());
  }

  init(canvasElement: HTMLElement) {
    const handleFocus = () => {
      this.state.focus = true;
      this.emit("focus");
    };

    const handleBlur = () => {
      this.state.focus = false;
      this.emit("blur");
    };

    canvasElement.addEventListener("focus", handleFocus);
    canvasElement.addEventListener("blur", handleBlur);

    this.attachButton("accept", "accept");
    this.attachButton("reject", "reject");

    this.buttonHandlers.set("canvasFocus", handleFocus);
    this.buttonHandlers.set("canvasBlur", handleBlur);

    return () => this.cleanup(canvasElement);
  }

  private attachButton(buttonId: string, event: InputEvent) {
    const button = document.getElementById(buttonId);
    if (!button) {
      console.warn(`Button #${buttonId} not found`);
      return;
    }

    const handler = () => {
      this.triggerEvent(event);
    };

    button.addEventListener("click", handler);
    this.buttonHandlers.set(buttonId, handler);
  }

  private triggerEvent(event: InputEvent) {
    if (event === "accept") {
      this.state.accept = true;
    } else if (event === "reject") {
      this.state.reject = true;
    }

    this.emit(event);
  }

  private emit(event: InputEvent) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }

  getState(): CharacterInput {
    return { ...this.state };
  }

  resetInput(input: keyof CharacterInput) {
    this.state[input] = false;
  }

  reset() {
    this.state.accept = false;
    this.state.reject = false;
  }

  on(event: InputEvent, callback: () => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.add(callback);
    }
  }

  off(event: InputEvent, callback: () => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private cleanup(canvasElement: HTMLElement) {
    const focusHandler = this.buttonHandlers.get("canvasFocus");
    const blurHandler = this.buttonHandlers.get("canvasBlur");

    if (focusHandler) {
      canvasElement.removeEventListener("focus", focusHandler);
    }
    if (blurHandler) {
      canvasElement.removeEventListener("blur", blurHandler);
    }

    ["accept", "reject"].forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      const handler = this.buttonHandlers.get(buttonId);

      if (button && handler) {
        button.removeEventListener("click", handler);
      }
    });

    this.buttonHandlers.clear();
  }

  destroy() {
    this.listeners.clear();
    this.reset();
  }
}
