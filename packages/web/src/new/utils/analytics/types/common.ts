export type MapActionWithNoParams<U> = U extends string ? { name: U } : never;

export type OpenAction<U> = U extends string ? { name: U; params: { Last_Screen: string } } : never;
