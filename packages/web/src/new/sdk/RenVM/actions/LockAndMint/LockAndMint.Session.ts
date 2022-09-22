import { RenVMError } from '../../models/RenVMError';

export const getSessionDay = () => Math.floor(Date.now() / 1000 / 60 / 60 / 24);
export const getSessionExpiry = () => (getSessionDay() + 3) * 60 * 60 * 24 * 1000;
export const getNonce = () =>
  Buffer.from(getSessionDay().toString(16).padStart(32)).toString('hex');

export type SessionType = {
  createdAt: number;
  endAt: number;
  nonce: string;
};

export class LockAndMintSession implements SessionType {
  createdAt: number;
  endAt: number;
  nonce: string;

  constructor({ nonce, createdAt, endAt }: { nonce?: string; createdAt?: number; endAt?: number }) {
    if (!createdAt) {
      createdAt = Date.now();
    }

    if (endAt && endAt < createdAt) {
      throw RenVMError.other('Invalid session');
    }

    this.nonce = nonce || getNonce();

    this.createdAt = createdAt;

    this.endAt = endAt || getSessionExpiry();
  }

  get isValid(): boolean {
    return this.endAt < Date.now();
  }

  static get default(): LockAndMintSession {
    return new LockAndMintSession({
      nonce: getNonce(),
      createdAt: Date.now(),
      endAt: getSessionExpiry(),
    });
  }
}
