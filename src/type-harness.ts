import { Relay } from "./engine/core/Relay";
import type { IRenderer } from "./engine/interfaces/IRenderer";
import type { GameState, GemGameEvents, GridCoord } from "./game/types";

const relay = new Relay<GemGameEvents>();
const from: GridCoord = { row: 0, col: 0 };
const to: GridCoord = { row: 0, col: 1 };

relay.on("gems:swapped", (payload) => {
  const nextFrom: GridCoord = payload.from;
  const nextTo: GridCoord = payload.to;
  void nextFrom;
  void nextTo;
});

relay.emit("gems:swapped", { from, to });

// @ts-expect-error Unknown Relay events must be rejected by the type system.
relay.emit("gems:swappped", { from, to });

// @ts-expect-error The score event payload must include delta and total.
relay.emit("score:updated", { total: 10 });

const state: GameState = {
  board: {
    rows: 8,
    cols: 8,
    cells: []
  },
  selectedCell: null,
  score: 0,
  combo: 0,
  phase: "idle"
};

void state;

const renderer: IRenderer<GameState> = {
  render(readonlyState) {
    // @ts-expect-error Renderers receive deep readonly state and cannot mutate game score.
    readonlyState.score = 100;
  }
};

void renderer;
