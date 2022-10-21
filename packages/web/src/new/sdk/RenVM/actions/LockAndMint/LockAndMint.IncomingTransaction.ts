import { u64 } from '@solana/spl-token';
import { Transform, Type } from 'class-transformer';

export class BlockstreamInfoStatus {
  // @ts-ignore
  confirmed: boolean;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  blockHeight?: u64;
  blockHash?: string;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  blockTime?: u64;
}

export class IncomingTransaction {
  // @ts-ignore
  txid: string;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  vout: u64;
  @Type(() => BlockstreamInfoStatus)
  // @ts-ignore
  status: BlockstreamInfoStatus;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  value: u64;
}
