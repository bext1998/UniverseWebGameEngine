import type { IScene } from "../../engine/interfaces/IScene";
import type { GameState } from "../types";

export class MenuScene implements IScene<GameState> {
  readonly name = "MenuScene";
}
