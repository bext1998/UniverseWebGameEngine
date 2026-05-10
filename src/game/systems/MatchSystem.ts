import type { ISystem } from "../../engine/interfaces/ISystem";
import type { ReadonlyDeep } from "../../engine/interfaces/ReadonlyDeep";
import type { GameState } from "../types";

export class MatchSystem implements ISystem<GameState> {
  readonly name = "MatchSystem";

  update(state: ReadonlyDeep<GameState>): GameState {
    return state;
  }
}
