import type { ReadonlyDeep } from "./ReadonlyDeep";

export interface ISystem<TState = unknown, TContext = unknown> {
  readonly name: string;
  onInit?(state: ReadonlyDeep<TState>, context: TContext): TState | void;
  update(state: ReadonlyDeep<TState>, deltaTime: number, context: TContext): TState | void;
  dispose?(): void;
}
