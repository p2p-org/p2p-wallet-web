import { capitalizingFirstLetter } from 'new/utils/StringExtensions';

export enum Direction {
  to = 'to',
  from = 'from',
}

export class Selector {
  mintTokenSymbol: string;
  chainName: string;
  direction: Direction;

  constructor({
    mintTokenSymbol,
    chainName,
    direction,
  }: {
    mintTokenSymbol: string;
    chainName: string;
    direction: Direction;
  }) {
    this.mintTokenSymbol = mintTokenSymbol;
    this.chainName = chainName;
    this.direction = direction;
  }

  toString(): string {
    return `${this.mintTokenSymbol}/${this.direction}${capitalizingFirstLetter(this.chainName)}`;
  }
}
