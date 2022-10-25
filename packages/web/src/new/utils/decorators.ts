export function notImplemented() {
  return function (_: unknown, property: string, descriptor: PropertyDescriptor) {
    descriptor.value = function () {
      throw new TypeError(`${property} is not implemented`);
    };
  };
}
