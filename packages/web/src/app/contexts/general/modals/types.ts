export enum ModalType {
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_DETAILS,
  SHOW_MODAL_TRANSACTION_STATUS,
  SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
  SHOW_MODAL_ERROR,
  SHOW_MODAL_PROCEED_USERNAME,
  SHOW_MODAL_ADD_COIN,
}

export type ModalPropsType<T = boolean> = {
  close: (result?: T) => void;
  [prop: string]: any;
};
