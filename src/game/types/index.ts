export type GemType = "red" | "blue" | "green" | "yellow" | "purple";

export type GamePhase =
  | "idle"
  | "swapping"
  | "clearing"
  | "refilling"
  | "gameover";

export interface GridCoord {
  readonly row: number;
  readonly col: number;
}

export interface Gem {
  readonly id: string;
  readonly type: GemType;
}

export interface BoardCell {
  readonly position: GridCoord;
  readonly gem: Gem | null;
}

export interface BoardState {
  readonly rows: number;
  readonly cols: number;
  readonly cells: ReadonlyArray<ReadonlyArray<BoardCell>>;
}

export interface GameState {
  readonly board: BoardState;
  readonly selectedCell: GridCoord | null;
  readonly score: number;
  readonly combo: number;
  readonly phase: GamePhase;
}

export interface GemGameEvents {
  "gem:selected": { readonly position: GridCoord };
  "gems:swapped": { readonly from: GridCoord; readonly to: GridCoord };
  "matches:cleared": { readonly cells: readonly GridCoord[]; readonly combo: number };
  "board:refilled": { readonly cells: readonly GridCoord[] };
  "score:updated": { readonly delta: number; readonly total: number };
  "game:over": { readonly finalScore: number };
}
