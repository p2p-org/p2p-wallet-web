export type MapActionWithNoParams<U> = U extends unknown ? { name: U } : never;

export type WithLastScreenActionNames<U> = U extends {
  name: infer NameType;
  params: { Last_Screen: string | null };
}
  ? NameType
  : never;
