import type { GemType } from "../types";

export const GEM_TYPES = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple"
] as const satisfies readonly GemType[];

export const GEM_SCORE_TABLE: Record<GemType, number> = {
  red: 10,
  blue: 10,
  green: 10,
  yellow: 10,
  purple: 10
};

export const GEM_WEIGHT_TABLE: Record<GemType, number> = {
  red: 1,
  blue: 1,
  green: 1,
  yellow: 1,
  purple: 1
};
