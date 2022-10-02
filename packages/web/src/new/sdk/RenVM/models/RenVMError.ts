class UnauthorizedError extends Error {}
class ParamsMissingError extends Error {}
class InvalidEndpointError extends Error {}
class UnknownError extends Error {}
class OtherError extends Error {}

export class RenVMError extends Error {
  static unauthorized(): UnauthorizedError {
    return new UnauthorizedError('Unauthorized');
  }

  static unknown(): UnknownError {
    return new UnknownError('Unknown error');
  }

  static paramsMissing(): ParamsMissingError {
    return new ParamsMissingError('One or some parameters are missing');
  }

  static invalidEndpoint(): InvalidEndpointError {
    return new InvalidEndpointError('Invalid endpoint');
  }

  //

  static other(reason?: string): OtherError {
    return new OtherError(reason);
  }

  static equals(lhs: Error, rhs: Error) {
    if (isSameInstance(lhs, rhs, ParamsMissingError)) {
      return lhs.message === rhs.message;
    }

    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSameInstance(lhs: Error, rhs: Error, Instance: any) {
  return lhs instanceof Instance && rhs instanceof Instance;
}
