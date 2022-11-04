import type {
  ParsedInstruction as ParsedInstructionWeb3,
  ParsedMessage,
  ParsedTransaction,
  PartiallyDecodedInstruction,
  TokenAmount,
} from '@solana/web3.js';

export type ConfirmedTransaction = Omit<ParsedTransaction, 'message'> & {
  message: Message;
};

export type Message = Omit<ParsedMessage, 'instructions'> & {
  instructions: ParsedInstruction[];
};

export type ParsedInstruction = Omit<ParsedInstructionWeb3, 'parsed'> &
  PartiallyDecodedInstruction & {
    parsed?: {
      info: {
        owner?: string;
        account?: string;
        source?: string;
        destination?: string;

        // create account
        lamports?: number;
        newAccount?: string;
        space?: number;

        // initialize account
        mint?: string;
        rentSysvar?: string;

        // approve
        amount?: string;
        delegate?: string;

        // transfer
        authority?: string;
        wallet?: string; // spl-associated-token-account

        // transferChecked
        tokenAmount?: Partial<TokenAmount>;
      };
      type?: string;
    };
  };
