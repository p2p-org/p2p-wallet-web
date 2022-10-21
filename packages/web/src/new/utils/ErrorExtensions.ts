import { SolanaError } from 'new/sdk/SolanaSDK';

export function isAlreadyInUseSolanaError(error: Error): boolean {
  if (error instanceof SolanaError) {
    console.error('do it', error);
    // TODO: invalidResponse
    // response.data?.logs?.contains(
    // starts(with: "Allocate: account Address { address: ") &&
    //             hasSuffix("} already in use")
  }
  return false;
}
