export type HasEqual<T> = { equals: (other: T) => boolean };

export interface Serializable<T> {
  serialize(): T;
}
