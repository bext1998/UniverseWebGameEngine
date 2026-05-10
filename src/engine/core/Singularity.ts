import type { IScene } from "../interfaces/IScene";
import type { ReadonlyDeep } from "../interfaces/ReadonlyDeep";
import { LogicCore } from "./LogicCore";
import { Relay } from "./Relay";
import { RenderCore, type RenderCoreConfig } from "./RenderCore";

export type EngineStatus = "idle" | "running" | "paused" | "stopped";

export interface UniverseEngineConfig extends RenderCoreConfig {}

export class Singularity<
  EventMap extends object = Record<string, unknown>,
  TState = unknown,
  TContext = unknown
> {
  readonly relay = new Relay<EventMap>();
  readonly logicCore = new LogicCore<TState, TContext>();
  readonly renderCore: RenderCore;

  private status: EngineStatus = "idle";
  private initialized = false;
  private state!: TState;
  private context!: TContext;

  constructor(config: UniverseEngineConfig) {
    this.renderCore = new RenderCore(config);
    this.logicCore.loop.onTick((deltaTime) => {
      if (!this.initialized) {
        return;
      }

      this.state = this.logicCore.update(
        this.state as ReadonlyDeep<TState>,
        deltaTime,
        this.context
      );

      const context = this.renderCore.getContext();

      if (!context) {
        return;
      }

      this.logicCore.scenes.render(this.state as ReadonlyDeep<TState>, context);
      this.renderCore.render();
    });
  }

  init(state: TState, context: TContext): void {
    this.renderCore.init();
    this.state = state;
    this.context = context;
    this.initialized = true;
    this.status = "idle";
  }

  use(scene: IScene<TState, TContext>): void {
    if (!this.initialized) {
      throw new Error("[Universe:Scene] Engine must be initialized before use().");
    }

    this.state = this.logicCore.scenes.setScene(
      scene,
      this.state as ReadonlyDeep<TState>,
      this.context
    );
  }

  start(): void {
    if (!this.initialized) {
      throw new Error("[Universe:Engine] Engine must be initialized before start().");
    }

    this.logicCore.loop.start();
    this.status = "running";
  }

  pause(): void {
    this.logicCore.loop.pause();
    this.status = "paused";
  }

  stop(): void {
    this.logicCore.loop.stop();
    this.logicCore.scenes.clearScene();
    this.status = "stopped";
  }

  getRelay(): Relay<EventMap> {
    return this.relay;
  }

  getStatus(): EngineStatus {
    return this.status;
  }
}
