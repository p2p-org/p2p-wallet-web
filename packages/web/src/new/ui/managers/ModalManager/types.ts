export type ModalPropsType<T = boolean, P = any> = {
  close: (result?: T) => void;
} & {
  [K in keyof P]: P[K];
};
