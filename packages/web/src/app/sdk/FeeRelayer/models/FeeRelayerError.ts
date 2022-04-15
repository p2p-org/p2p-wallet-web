/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { u64 } from '@solana/spl-token';

enum ErrorType {
  parseHashError = 'ParseHashError',
  parsePubkeyError = 'ParsePubkeyError',
  parseKeypairError = 'ParseKeypairError',
  parseSignatureError = 'ParseSignatureError',
  wrongSignature = 'WrongSignature',
  signerError = 'SignerError',
  clientError = 'ClientError',
  programError = 'ProgramError',
  tooSmallAmount = 'TooSmallAmount',
  notEnoughBalance = 'NotEnoughBalance',
  notEnoughTokenBalance = 'NotEnoughTokenBalance',
  decimalsMismatch = 'DecimalsMismatch',
  tokenAccountNotFound = 'TokenAccountNotFound',
  incorrectAccountOwner = 'IncorrectAccountOwner',
  tokenMintMismatch = 'TokenMintMismatch',
  unsupportedRecipientAddress = 'UnsupportedRecipientAddress',
  feeCalculatorNotFound = 'FeeCalculatorNotFound',
  notEnoughOutAmount = 'NotEnoughOutAmount',
  unknownSwapProgramId = 'UnknownSwapProgramId',

  unknown = 'UnknownError',
}

class ErrorDetail {
  type?: ErrorType;
  data?: ErrorData;

  constructor(type?: ErrorType, data?: ErrorData) {
    this.type = type;
    this.data = data;
  }

  // TODO: from
}

class ErrorData {
  array?: string[];
  dict?: { [key in string]: u64 }[];

  constructor(array?: string[], dict?: { [key in string]: u64 }[]) {
    this.array = array;
    this.dict = dict;
  }

  // TODO: from
}

export class FeeRelayerError extends Error {
  code: number;
  data?: ErrorDetail;

  constructor(code: number, message: string, data?: ErrorDetail) {
    super(message);

    this.code = code;
    this.data = data;
  }

  static unknown() {
    return new FeeRelayerError(-1, 'Unknown error');
  }

  static wrongAddress() {
    return new FeeRelayerError(-2, 'Wrong address');
  }

  static swapPoolsNotFound() {
    return new FeeRelayerError(-3, 'Swap pools not found');
  }

  static transitTokenMintNotFound() {
    return new FeeRelayerError(-4, 'Transit token mint not found');
  }

  static invalidAmount() {
    return new FeeRelayerError(-5, 'Invalid amount');
  }

  static invalidSignature() {
    return new FeeRelayerError(-6, 'Invalid signature');
  }

  static unsupportedSwap() {
    return new FeeRelayerError(-7, 'Unsupported swap');
  }

  static relayInfoMissing() {
    return new FeeRelayerError(-8, 'Relay info missing');
  }

  static invalidFeePayer() {
    return new FeeRelayerError(-9, 'Invalid fee payer');
  }

  static feePayingTokenMissing() {
    return new FeeRelayerError(-10, 'No token for paying fee is provided');
  }

  static unauthorized() {
    return new FeeRelayerError(-11, 'Unauthorized');
  }
}
