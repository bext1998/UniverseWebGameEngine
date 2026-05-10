export class ObjectPool<TItem> {
  private readonly available: TItem[] = [];

  constructor(
    private readonly createItem: () => TItem,
    private readonly resetItem: (item: TItem) => void = () => undefined
  ) {}

  acquire(): TItem {
    return this.available.pop() ?? this.createItem();
  }

  release(item: TItem): void {
    this.resetItem(item);
    this.available.push(item);
  }

  size(): number {
    return this.available.length;
  }

  clear(): void {
    this.available.length = 0;
  }
}
