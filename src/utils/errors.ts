export class DuplicateModalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateModalError';
  }
}
