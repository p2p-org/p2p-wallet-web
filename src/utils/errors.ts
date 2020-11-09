export class DuplicateModalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuplicateModalError';
  }
}
