class InvalidRequestError extends Error {}
class OtherError extends Error {}
class UnknownError extends Error {}

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

  // Invalid Requests
  static invalidRequest(reason?: string): InvalidRequestError {
    return new InvalidRequestError(reason);
  }

  // Other
  static other(message: string): OtherError {
    return new OtherError(message);
  }
  static unknown(): UnknownError {
    return new UnknownError();
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
