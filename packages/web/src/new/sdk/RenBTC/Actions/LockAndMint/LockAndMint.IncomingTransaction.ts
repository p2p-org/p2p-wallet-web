import { Type } from 'class-transformer';

type BlockstreamInfoStatusType = {
  confirmed: boolean;
  blockHeight?: number;
  blockHash?: string;
  blockTime?: number;
};

export class BlockstreamInfoStatus implements BlockstreamInfoStatusType {
  //@ts-ignore
  confirmed: boolean;
  blockHeight?: number;
  blockHash?: string;
  blockTime?: number;

  constructor(props: BlockstreamInfoStatusType) {
    if (!props) {
      return;
    }

    this.confirmed = props.confirmed;
    this.blockHeight = props.blockHeight;
    this.blockHash = props.blockHash;
    this.blockTime = props.blockTime;
  }
}

export type IncomingTransactionType = {
  txid: string;
  vout: number;
  status: BlockstreamInfoStatus;
  value: number;
};

export class LockAndMintIncomingTransaction {
  //@ts-ignore
  txid: string;
  //@ts-ignore
  vout: number;
  @Type(() => BlockstreamInfoStatus)
  //@ts-ignore
  status: BlockstreamInfoStatus;
  //@ts-ignore
  value: number;

  constructor(props: IncomingTransactionType) {
    if (!props) {
      return;
    }

    this.txid = props.txid;
    this.vout = props.vout;
    this.status = props.status;
    this.value = props.value;
  }
}
