import type { IRenderer } from "../../engine/interfaces/IRenderer";
import type { ReadonlyDeep } from "../../engine/interfaces/ReadonlyDeep";
import type { GameState } from "../types";

export class BoardRenderer implements IRenderer<GameState> {
  render(_state: ReadonlyDeep<GameState>, _context: CanvasRenderingContext2D): void {
    return;
  }
}
