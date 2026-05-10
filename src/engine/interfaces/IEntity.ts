export type EntityId = string;

export interface IEntity {
  readonly id: EntityId;
  readonly active: boolean;
}
