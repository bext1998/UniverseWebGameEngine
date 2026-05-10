export type TickHandler = (deltaTime: number) => void;

export class LoopCore {
  private readonly tickHandlers = new Set<TickHandler>();
  private running = false;
  private frameId: number | null = null;
  private lastTimestamp: number | null = null;

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = null;
    this.scheduleNextFrame();
  }

  pause(): void {
    this.running = false;
    this.cancelScheduledFrame();
  }

  stop(): void {
    this.running = false;
    this.lastTimestamp = null;
    this.cancelScheduledFrame();
  }

  isRunning(): boolean {
    return this.running;
  }

  onTick(handler: TickHandler): () => void {
    this.tickHandlers.add(handler);

    return () => {
      this.tickHandlers.delete(handler);
    };
  }

  tick(deltaTime: number): void {
    if (!this.running) {
      return;
    }

    for (const handler of this.tickHandlers) {
      handler(deltaTime);
    }
  }

  private scheduleNextFrame(): void {
    if (!this.running || this.frameId !== null) {
      return;
    }

    const requestFrame =
      globalThis.requestAnimationFrame?.bind(globalThis) ??
      ((callback: FrameRequestCallback) =>
        globalThis.setTimeout(() => callback(performance.now()), 16));

    this.frameId = requestFrame((timestamp) => {
      this.frameId = null;

      if (!this.running) {
        return;
      }

      const deltaTime =
        this.lastTimestamp === null ? 0 : timestamp - this.lastTimestamp;

      this.lastTimestamp = timestamp;
      this.tick(deltaTime);
      this.scheduleNextFrame();
    });
  }

  private cancelScheduledFrame(): void {
    if (this.frameId === null) {
      return;
    }

    const cancelFrame =
      globalThis.cancelAnimationFrame?.bind(globalThis) ??
      ((handle: number) => globalThis.clearTimeout(handle));

    cancelFrame(this.frameId);
    this.frameId = null;
  }
}
