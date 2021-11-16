import { PublicKey } from '@solana/web3.js';
import type BN from 'bn.js';
import { Decimal } from 'decimal.js';

import { minorAmountToMajor, toDecimal } from 'utils/amount';
import type { Serializable } from 'utils/types';

export type SerializableToken = {
  address: string;
  decimals: number;
  supply: string;
  mintAuthority?: string;
  name?: string;
  symbol?: string;
  color?: string;
  icon?: string;
  isSimulated?: boolean;
};

export class Token implements Serializable<SerializableToken> {
  readonly address: PublicKey;

  readonly decimals: number;

  readonly supply: Decimal;

  readonly mintAuthority?: PublicKey;

  readonly name?: string;

  readonly symbol?: string;

  readonly color?: string;

  readonly icon?: string;

  // it's simulated WSOL address
  readonly isSimulated?: boolean;

  constructor(
    address: PublicKey,
    decimals: number,
    supply: BN | number | Decimal,
    mintAuthority?: PublicKey,
    name?: string,
    symbol?: string,
    color?: string,
    icon?: string,
    isSimulated?: boolean,
  ) {
    this.address = address;
    this.decimals = decimals;
    this.supply = toDecimal(supply);
    this.mintAuthority = mintAuthority;
    this.name = name;
    this.symbol = symbol;
    this.color = color;
    this.icon = icon;
    this.isSimulated = isSimulated;
  }

  toMajorDenomination(amountInMinorDenomination: number | Decimal): Decimal {
    return minorAmountToMajor(amountInMinorDenomination, this).toDecimalPlaces(this.decimals);
  }

  toString(): string {
    return this.name ? `${this.name} (${this.symbol})` : this.address.toBase58();
  }

  equals(other: Token): boolean {
    return this.address.equals(other.address);
  }

  serialize(): SerializableToken {
    return {
      address: this.address.toBase58(),
      decimals: this.decimals,
      supply: this.supply.toString(),
      mintAuthority: this.mintAuthority?.toBase58(),
      name: this.name,
      symbol: this.symbol,
      color: this.color,
      icon: this.icon,
      isSimulated: this.isSimulated,
    };
  }

  static from(serializableToken: SerializableToken): Token {
    const mintAuthority = (serializableToken.mintAuthority &&
      new PublicKey(serializableToken.mintAuthority)) as PublicKey | undefined;

    return new Token(
      new PublicKey(serializableToken.address),
      serializableToken.decimals,
      new Decimal(serializableToken.supply),
      mintAuthority,
      serializableToken.name,
      serializableToken.symbol,
      serializableToken.color,
      serializableToken.icon,
      serializableToken.isSimulated,
    );
  }
}
