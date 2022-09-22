class UnauthorizedError extends Error {}
class ParamMissingError extends Error {}
class InvalidEndpointError extends Error {}
class UnknownError extends Error {}
class OtherError extends Error {}

export class RenVMError extends Error {
  static equals(lhs: Error, rhs: Error) {
    if (isSameInstance(lhs, rhs, ParamMissingError)) {
      return lhs.message === rhs.message;
    }

    return false;
  }

  static unauthorized(): UnauthorizedError {
    return new UnauthorizedError('Unauthorized');
  }

  static paramMissing(): ParamMissingError {
    return new ParamMissingError('One or some parameters are missing');
  }

  static invalidEndpoint(): InvalidEndpointError {
    return new InvalidEndpointError('Invalid endpoint');
  }

  static unknown(): UnknownError {
    return new UnknownError('Unknown error');
  }

  static other(reason?: string): OtherError {
    return new OtherError(reason);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSameInstance(lhs: Error, rhs: Error, Instance: any) {
  return lhs instanceof Instance && rhs instanceof Instance;
}
