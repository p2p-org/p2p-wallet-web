import type { KeyedTransactionInfo } from '@p2p-wallet-web/sail';

import type { ParsedConfirmedTransaction } from '../../../types';
import type { CustomParsedTransaction } from './parsers';
import {
  CreateAccountParser,
  OrcaSwapParser,
  RentBTCBurnParser,
  RentBTCMintParser,
  SerumSwapParser,
  TransferParser,
} from './parsers';

export const parser = (info: KeyedTransactionInfo): CustomParsedTransaction => {
  // get data
  const transactionInfo = info.transactionInfo as ParsedConfirmedTransaction;
  const instructions = transactionInfo.transaction.message.instructions;
  const innerInstructions = transactionInfo.meta?.innerInstructions;

  let parsed;

  switch (true) {
    case OrcaSwapParser.can(instructions):
      parsed = OrcaSwapParser.parse(transactionInfo);
      break;
    case SerumSwapParser.can(instructions):
      parsed = SerumSwapParser.parse(transactionInfo);
      break;
    case CreateAccountParser.can(instructions):
      parsed = CreateAccountParser.parse(transactionInfo);
      break;
    case TransferParser.can(instructions):
      parsed = TransferParser.parse(transactionInfo);
      break;
    case RentBTCMintParser.can(instructions, innerInstructions):
      parsed = RentBTCMintParser.parse(transactionInfo);
      break;
    case RentBTCBurnParser.can(instructions):
      parsed = RentBTCBurnParser.parse(transactionInfo);
      break;
    default:
      parsed = null;
      break;
  }

  return parsed;
};
