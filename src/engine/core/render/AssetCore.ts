export type AssetId = string;

export interface AssetRecord<TAsset = unknown> {
  readonly id: AssetId;
  readonly value: TAsset;
}

export class AssetCore<TAsset = unknown> {
  private readonly assets = new Map<AssetId, AssetRecord<TAsset>>();

  register(asset: AssetRecord<TAsset>): void {
    this.assets.set(asset.id, asset);
  }

  get(id: AssetId): AssetRecord<TAsset> | undefined {
    return this.assets.get(id);
  }

  remove(id: AssetId): boolean {
    return this.assets.delete(id);
  }

  clear(): void {
    this.assets.clear();
  }
}
