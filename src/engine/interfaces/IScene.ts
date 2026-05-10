import type { ReadonlyDeep } from "./ReadonlyDeep";

export interface IScene<TState = unknown, TContext = unknown> {
  readonly name: string;
  onInit?(state: ReadonlyDeep<TState>, context: TContext): TState | void;
  update?(state: ReadonlyDeep<TState>, deltaTime: number, context: TContext): TState | void;
  render?(state: ReadonlyDeep<TState>, context: CanvasRenderingContext2D): void;
  dispose?(): void;
}
