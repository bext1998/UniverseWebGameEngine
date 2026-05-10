import type { EntityId, IEntity } from "../../interfaces/IEntity";

export class EntityCore<TEntity extends IEntity = IEntity> {
  private readonly entities = new Map<EntityId, TEntity>();

  add(entity: TEntity): void {
    this.entities.set(entity.id, entity);
  }

  get(id: EntityId): TEntity | undefined {
    return this.entities.get(id);
  }

  remove(id: EntityId): boolean {
    return this.entities.delete(id);
  }

  list(): readonly TEntity[] {
    return [...this.entities.values()];
  }

  clear(): void {
    this.entities.clear();
  }
}
