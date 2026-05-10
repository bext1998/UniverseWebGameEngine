import type { GamePhase } from "../types";

export const GAME_CONFIG = {
  initialScore: 0,
  initialCombo: 0,
  initialPhase: "idle"
} as const satisfies {
  readonly initialScore: number;
  readonly initialCombo: number;
  readonly initialPhase: GamePhase;
};
