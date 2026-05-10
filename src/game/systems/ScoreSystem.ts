import type { ISystem } from "../../engine/interfaces/ISystem";
import type { ReadonlyDeep } from "../../engine/interfaces/ReadonlyDeep";
import type { GameState } from "../types";

export class ScoreSystem implements ISystem<GameState> {
  readonly name = "ScoreSystem";

  update(state: ReadonlyDeep<GameState>): GameState {
    return state;
  }
}
