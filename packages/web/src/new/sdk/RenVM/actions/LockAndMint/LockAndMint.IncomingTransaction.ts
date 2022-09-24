import { Type } from 'class-transformer';

export class BlockstreamInfoStatus {
  confirmed: boolean;
  blockHeight?: number;
  blockHash?: string;
  blockTime?: number;

  constructor({
    confirmed,
    blockHeight,
    blockHash,
    blockTime,
  }: {
    confirmed: boolean;
    blockHeight?: number;
    blockHash?: string;
    blockTime?: number;
  }) {
    this.confirmed = confirmed;
    this.blockHeight = blockHeight;
    this.blockHash = blockHash;
    this.blockTime = blockTime;
  }
}

export type IncomingTransactionType = {
  txid: string;
  vout: number;
  status: BlockstreamInfoStatus;
  value: number;
};

export class IncomingTransaction {
  txid: string;
  vout: number;
  @Type(() => BlockstreamInfoStatus)
  status: BlockstreamInfoStatus;
  value: number;

  constructor({
    txid,
    vout,
    status,
    value,
  }: {
    txid: string;
    vout: number;
    status: BlockstreamInfoStatus;
    value: number;
  }) {
    this.txid = txid;
    this.vout = vout;
    this.status = status;
    this.value = value;
  }
}
