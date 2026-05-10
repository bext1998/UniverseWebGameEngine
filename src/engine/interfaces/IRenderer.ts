import type { ReadonlyDeep } from "./ReadonlyDeep";

export interface IRenderer<TState = unknown> {
  render(state: ReadonlyDeep<TState>, context: CanvasRenderingContext2D): void;
}
