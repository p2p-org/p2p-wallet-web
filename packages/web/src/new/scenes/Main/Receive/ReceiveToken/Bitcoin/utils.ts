// Amount of time remaining until gateway expires
// We remove 1 day from the ren-tx expiry to reflect the extra mint
// submission leeway
// FIXME: once ren-tx takes the two stages into account, fix this

// TODO: in iOS code there is no operation described above. Do we need it?
export const getRemainingGatewayTime = (expiryTime: number): number =>
  Math.ceil(expiryTime - 24 * 60 * 60 * 1000 - Number(new Date()));

const millisecondsToHMS = (milliseconds: number) => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
  // take absolute hours as they may be greater than 24
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  return { hours, minutes, seconds };
};

const pad = (value: number) => {
  return String(value).padStart(2, '0');
};

export const getFormattedHMS = (milliseconds: number) => {
  const { hours, minutes, seconds } = millisecondsToHMS(milliseconds);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
