export interface RenderLayer {
  readonly id: string;
  readonly order: number;
  readonly visible: boolean;
}

export class LayerCore {
  private readonly layers = new Map<string, RenderLayer>();

  add(layer: RenderLayer): void {
    this.layers.set(layer.id, layer);
  }

  get(id: string): RenderLayer | undefined {
    return this.layers.get(id);
  }

  remove(id: string): boolean {
    return this.layers.delete(id);
  }

  listVisible(): readonly RenderLayer[] {
    return [...this.layers.values()]
      .filter((layer) => layer.visible)
      .sort((a, b) => a.order - b.order);
  }

  clear(): void {
    this.layers.clear();
  }
}
