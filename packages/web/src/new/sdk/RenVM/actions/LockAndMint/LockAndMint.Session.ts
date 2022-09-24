import { RenVMError } from '../../models';

export interface SessionJSONType {
  createdAt: number;
  endAt: number;
  nonce: string;
}

export class Session {
  createdAt: Date;
  endAt: Date;
  nonce: string;

  constructor({
    nonce,
    createdAt = new Date(),
    endAt,
  }: {
    nonce?: string;
    createdAt?: Date;
    endAt?: Date;
  } = {}) {
    if (endAt && endAt <= createdAt) {
      throw RenVMError.other('Invalid session');
    }

    this.nonce = nonce ?? generateNonce(Math.floor(Date.now() / 1000 / 60 / 60 / 24));
    this.createdAt = createdAt;

    this.endAt = endAt ?? new Date(this.createdAt.setHours(this.createdAt.getHours() + 36));
  }

  get isValid(): boolean {
    return this.endAt > new Date();
  }

  fromJSON(json: SessionJSONType): Session {
    return new Session({
      nonce: json.nonce,
      createdAt: new Date(json.createdAt),
      endAt: new Date(json.endAt),
    });
  }
}

function generateNonce(sessionDay: number): string {
  return Buffer.from(sessionDay.toString(16).padStart(32)).toString('hex');
}
