import type { IScene } from "../../engine/interfaces/IScene";
import type { ReadonlyDeep } from "../../engine/interfaces/ReadonlyDeep";
import type { GameState } from "../types";

export class GameScene implements IScene<GameState> {
  readonly name = "GameScene";

  update(state: ReadonlyDeep<GameState>): GameState {
    return state;
  }
}
