import { EntityCore } from "./logic/EntityCore";
import { LoopCore } from "./logic/LoopCore";
import { SceneCore } from "./logic/SceneCore";
import type { ReadonlyDeep } from "../interfaces/ReadonlyDeep";

export class LogicCore<TState = unknown, TContext = unknown> {
  readonly loop = new LoopCore();
  readonly scenes = new SceneCore<TState, TContext>();
  readonly entities = new EntityCore();

  update(state: ReadonlyDeep<TState>, deltaTime: number, context: TContext): TState {
    return this.scenes.update(state, deltaTime, context);
  }
}
