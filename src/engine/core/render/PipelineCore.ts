export type RenderStep = (context: CanvasRenderingContext2D) => void;

export class PipelineCore {
  private readonly steps: RenderStep[] = [];

  addStep(step: RenderStep): () => void {
    this.steps.push(step);

    return () => {
      const index = this.steps.indexOf(step);

      if (index >= 0) {
        this.steps.splice(index, 1);
      }
    };
  }

  render(context: CanvasRenderingContext2D): void {
    for (const step of this.steps) {
      step(context);
    }
  }

  clear(): void {
    this.steps.length = 0;
  }
}
