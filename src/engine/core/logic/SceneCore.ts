import type { IScene } from "../../interfaces/IScene";
import type { ReadonlyDeep } from "../../interfaces/ReadonlyDeep";

export class SceneCore<TState = unknown, TContext = unknown> {
  private currentScene: IScene<TState, TContext> | null = null;

  setScene(
    scene: IScene<TState, TContext>,
    state: ReadonlyDeep<TState>,
    context: TContext
  ): TState {
    this.currentScene?.dispose?.();
    this.currentScene = scene;
    return scene.onInit?.(state, context) ?? (state as TState);
  }

  getScene(): IScene<TState, TContext> | null {
    return this.currentScene;
  }

  update(state: ReadonlyDeep<TState>, deltaTime: number, context: TContext): TState {
    return (
      this.currentScene?.update?.(state, deltaTime, context) ?? (state as TState)
    );
  }

  render(state: ReadonlyDeep<TState>, context: CanvasRenderingContext2D): void {
    this.currentScene?.render?.(state, context);
  }

  clearScene(): void {
    this.currentScene?.dispose?.();
    this.currentScene = null;
  }
}
