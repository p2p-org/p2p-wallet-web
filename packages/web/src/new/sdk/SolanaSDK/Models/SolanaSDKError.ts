// base class for "instanceof"
export class SolanaError extends Error {}

class UnauthorizedError extends SolanaError {}
class InvalidRequestError extends SolanaError {}
class OtherError extends SolanaError {}
class UnknownError extends SolanaError {}

export class SolanaSDKError {
  static equals(lhs: Error, rhs: Error) {
    if (isSameInstance(lhs, rhs, OtherError)) {
      return lhs.message === rhs.message;
    }
    if (isSameInstance(lhs, rhs, InvalidRequestError)) {
      return lhs.message === rhs.message;
    }

    return false;
  }

  static unauthorized(): UnauthorizedError {
    return new UnauthorizedError('unauthorized');
  }

  // Invalid Requests
  static invalidRequest(reason?: string): InvalidRequestError {
    return new InvalidRequestError(reason);
  }

  // TODO: invalidResponse
  // static invalidResponse(reason?: string): InvalidRequestError {
  //   return new InvalidRequestError(reason);
  // }

  // Other
  static other(message: string): OtherError {
    return new OtherError(message);
  }
  static unknown(): UnknownError {
    return new UnknownError('Unknown error');
  }

  // Predefined error
  static couldNotRetrieveAccountInfo(): OtherError {
    return new OtherError('Could not retrieve account info');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSameInstance(lhs: Error, rhs: Error, Instance: any) {
  return lhs instanceof Instance && rhs instanceof Instance;
}
