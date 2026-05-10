import { AssetCore } from "./render/AssetCore";
import { LayerCore } from "./render/LayerCore";
import { PipelineCore } from "./render/PipelineCore";

export interface RenderCoreConfig {
  readonly canvas: HTMLCanvasElement | string;
  readonly width: number;
  readonly height: number;
}

export class RenderCore {
  readonly pipeline = new PipelineCore();
  readonly layers = new LayerCore();
  readonly assets = new AssetCore();

  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  constructor(private readonly config: RenderCoreConfig) {}

  init(): CanvasRenderingContext2D {
    const canvas = this.resolveCanvas(this.config.canvas);
    canvas.width = this.config.width;
    canvas.height = this.config.height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("[Universe:Render] Canvas 2D context is unavailable.");
    }

    this.canvas = canvas;
    this.context = context;
    return context;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D | null {
    return this.context;
  }

  render(): void {
    if (!this.context) {
      return;
    }

    this.pipeline.render(this.context);
  }

  private resolveCanvas(canvas: HTMLCanvasElement | string): HTMLCanvasElement {
    if (typeof canvas !== "string") {
      return canvas;
    }

    const element = document.querySelector(canvas);

    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error(`[Universe:Render] Canvas element '${canvas}' was not found.`);
    }

    return element;
  }
}
