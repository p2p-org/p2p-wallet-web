export function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
