import type { ISystem } from "../../engine/interfaces/ISystem";
import type { ReadonlyDeep } from "../../engine/interfaces/ReadonlyDeep";
import type { GameState } from "../types";

export class GravitySystem implements ISystem<GameState> {
  readonly name = "GravitySystem";

  update(state: ReadonlyDeep<GameState>): GameState {
    return state;
  }
}
