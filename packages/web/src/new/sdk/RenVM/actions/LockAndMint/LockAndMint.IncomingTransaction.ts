import type { u64 } from '@solana/spl-token';
import { Type } from 'class-transformer';

export class BlockstreamInfoStatus {
  confirmed: boolean;
  blockHeight?: u64;
  blockHash?: string;
  blockTime?: u64;

  constructor({
    confirmed,
    blockHeight,
    blockHash,
    blockTime,
  }: {
    confirmed: boolean;
    blockHeight?: u64;
    blockHash?: string;
    blockTime?: u64;
  }) {
    this.confirmed = confirmed;
    this.blockHeight = blockHeight;
    this.blockHash = blockHash;
    this.blockTime = blockTime;
  }
}

export class IncomingTransaction {
  txid: string;
  vout: u64;
  @Type(() => BlockstreamInfoStatus)
  status: BlockstreamInfoStatus;
  value: u64;

  constructor({
    txid,
    vout,
    status,
    value,
  }: {
    txid: string;
    vout: u64;
    status: BlockstreamInfoStatus;
    value: u64;
  }) {
    this.txid = txid;
    this.vout = vout;
    this.status = status;
    this.value = value;
  }
}
