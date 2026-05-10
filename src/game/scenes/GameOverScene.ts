import type { IScene } from "../../engine/interfaces/IScene";
import type { GameState } from "../types";

export class GameOverScene implements IScene<GameState> {
  readonly name = "GameOverScene";
}
