import type {
  ParsedConfirmedTransaction as Web3ParsedConfirmedTransaction,
  ParsedConfirmedTransactionMeta as Web3ParsedConfirmedTransactionMeta,
  ParsedInstruction as Web3ParsedInstruction,
  ParsedMessage as Web3ParsedMessage,
  ParsedTransaction as Web3ParsedTransaction,
  PartiallyDecodedInstruction,
} from '@solana/web3.js';

export type ParsedInstruction = Web3ParsedInstruction &
  PartiallyDecodedInstruction & {
    parsed: {
      info: {
        owner: string;
        account: string;
        source: string;
        destination: string;

        // create account
        lamports: number;
        newAccount: string;
        space: number;

        // initialize account
        mint: string;
        rentSysvar: string;

        // approve
        amount: string;
        delegate: string;

        // transfer
        authority: string;
        wallet: string; // spl-associated-token-account

        // transferChecked
        tokenAmount?: {
          amount: string;
        };
      };
      type: string;
    };
  };

export type ParsedMessage = Web3ParsedMessage & {
  /** The atomically executed instructions for the transaction */
  instructions: ParsedInstruction[];
};

export type ParsedTransaction = Web3ParsedTransaction & {
  /** Message of the transaction */
  message: ParsedMessage;
};

export type ParsedInnerInstruction = {
  index: number;
  instructions: ParsedInstruction[];
};

export type ParsedConfirmedTransactionMeta = Web3ParsedConfirmedTransactionMeta & {
  innerInstructions?: ParsedInnerInstruction[] | null;
};

export type ParsedConfirmedTransaction = Web3ParsedConfirmedTransaction & {
  /** The details of the transaction */
  transaction: ParsedTransaction;
  /** Metadata produced from the transaction */
  meta: ParsedConfirmedTransactionMeta | null;
};
