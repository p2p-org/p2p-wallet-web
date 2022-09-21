export enum ModalType {
  SHOW_MODAL_RECEIVE_BITCOIN,
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_DETAILS,
  SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
  SHOW_MODAL_ERROR,
  SHOW_MODAL_PROCEED_USERNAME,
  SHOW_MODAL_SELECT_LIST_MOBILE,
}

export type ModalPropsType<T = boolean, P = any> = {
  close: (result?: T) => void;
} & {
  [K in keyof P]: P[K];
};
