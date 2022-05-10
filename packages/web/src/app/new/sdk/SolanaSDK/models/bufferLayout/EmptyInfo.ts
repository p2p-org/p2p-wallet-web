export class EmptyInfo {
  static decode(data: Buffer): EmptyInfo {
    return new EmptyInfo(data);
  }

  constructor(_data: Buffer) {}
}
