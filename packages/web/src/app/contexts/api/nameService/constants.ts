export const FEE_RELAYER_URL = process.env.REACT_APP_FEE_RELAYER_URL;

export const NAME_SERVICE_URL =
  process.env.REACT_APP_NAME_SERVICE_URL || `${FEE_RELAYER_URL}name_register`;
