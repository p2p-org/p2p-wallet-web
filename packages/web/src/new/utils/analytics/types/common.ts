export type MapActionWithNoParams<U> = U extends string ? { name: U } : never;
