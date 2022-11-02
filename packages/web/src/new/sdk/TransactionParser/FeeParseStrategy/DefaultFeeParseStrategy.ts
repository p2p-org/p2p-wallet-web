import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import { Cache } from 'new/sdk/Cache';
import type { Lamports, SolanaSDK, TransactionInfo } from 'new/sdk/SolanaSDK';
import { FeeAmount, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import type { FeeParseStrategy } from './FeeParseStrategy';

/// A default implementation for parsing transaction fee.
export class DefaultFeeParseStrategy implements FeeParseStrategy {
  apiClient: SolanaSDK;
  cache: Cache<string, any>;

  constructor({ apiClient, cache }: { apiClient: SolanaSDK; cache?: Cache<string, any> }) {
    this.apiClient = apiClient;
    this.cache = cache ?? new Cache();
  }

  async calculate({
    transactionInfo,
    feePayers,
  }: {
    transactionInfo: TransactionInfo;
    feePayers: string[];
  }): Promise<FeeAmount> {
    const confirmedTransaction = transactionInfo.transaction;

    // Prepare
    const lamportsPerSignature: Lamports = await this._getLamportPerSignature();
    const minRentExemption: Lamports = await this._getRentException();

    // get creating and closing account instruction
    const createTokenAccountInstructions = confirmedTransaction.message.instructions.filter(
      (inst) =>
        inst.programId.toString() === SolanaSDKPublicKey.tokenProgramId.toString() &&
        inst.parsed?.type === 'create',
    );
    const createWSOLAccountInstructions = confirmedTransaction.message.instructions.filter(
      (inst) =>
        inst.programId.toString() === SolanaSDKPublicKey.programId.toString() &&
        inst.parsed?.type === 'createAccount',
    );
    const closeAccountInstructions = confirmedTransaction.message.instructions.filter(
      (inst) =>
        inst.programId == SolanaSDKPublicKey.tokenProgramId && inst.parsed?.type === 'closeAccount',
    );
    const depositAccountsInstructions = closeAccountInstructions.filter(
      (closeInstruction) =>
        createWSOLAccountInstructions.some(
          (inst) => inst.parsed?.info.newAccount === closeInstruction.parsed?.info.account,
        ) ||
        createTokenAccountInstructions.some(
          (inst) => inst.parsed?.info.account === closeInstruction.parsed?.info.account,
        ),
    );

    // get fee
    const numberOfCreatedAccounts =
      createTokenAccountInstructions.length +
      createWSOLAccountInstructions.length -
      depositAccountsInstructions.length;
    const numberOfDepositAccounts = depositAccountsInstructions.length;

    let transactionFee = lamportsPerSignature.muln(confirmedTransaction.signatures.length);
    const accountCreationFee = minRentExemption.muln(numberOfCreatedAccounts);
    const depositFee = minRentExemption.muln(numberOfDepositAccounts);

    // check last compensation transaction
    const firstPubkey = confirmedTransaction.message.accountKeys[0]?.pubkey.toString();
    if (firstPubkey && feePayers.some((pubkey) => pubkey === firstPubkey)) {
      // TODO: - Fix later
      transactionFee = ZERO;
      // let lastTransaction, innerInstruction, innerInstructionAmount;
      // if (
      //   // check last "returning instruction"
      //   (lastTransaction = confirmedTransaction.message.instructions.at(-1)) &&
      //   // returning transaction must have RelayProgram id
      //   lastTransaction.programId.toString() ===
      //     RelayProgram.id(this.apiClient.endpoint.network).toString() &&
      //   // get inner transaction to get amount that have been returned
      //   (innerInstruction = transactionInfo.meta?.innerInstructions?.find(
      //     (innerInst) => innerInst.index === confirmedTransaction.message.instructions.length - 1,
      //   )) &&
      //   (innerInstructionAmount = innerInstruction.instructions[0]?.parsed?.info.lamports) &&
      //   // got the amount, check if user had to pay the transaction fee (not account creation fee)
      //   new u64(innerInstructionAmount).gt(accountCreationFee.add(depositFee))
      // ) {
      //   // do nothing
      // } else {
      //   // mark transaction as paid by P2p org
      //   transactionFee = ZERO;
      // }
    }

    return new FeeAmount({
      transaction: transactionFee,
      accountBalances: accountCreationFee,
      deposit: depositFee,
    });
  }

  private async _getRentException(): Promise<Lamports> {
    const kRentExemption = 'rentExemption';

    // Load from cache
    let rentExemption: Lamports | undefined = this.cache.value(kRentExemption) as
      | Lamports
      | undefined;
    if (rentExemption) {
      return rentExemption;
    }

    // Load from network
    rentExemption = await this.apiClient.getMinimumBalanceForRentExemption(65);

    // Store in cache
    this.cache.insert(rentExemption, kRentExemption);
    return rentExemption;
  }

  private async _getLamportPerSignature(): Promise<Lamports> {
    const kLamportsPerSignature = 'lamportsPerSignature';

    // Load from cache
    let lamportsPerSignature: Lamports | undefined = this.cache.value(kLamportsPerSignature) as
      | Lamports
      | undefined;
    if (lamportsPerSignature) {
      return lamportsPerSignature;
    }

    // Load from network
    const fee = await this.apiClient.provider.connection.getRecentBlockhash(); // @ios: was getFees()

    // Default value in case network in not available
    lamportsPerSignature = fee.feeCalculator?.lamportsPerSignature
      ? new u64(fee.feeCalculator.lamportsPerSignature)
      : new u64(5000);

    // Store in cache
    this.cache.insert(lamportsPerSignature, kLamportsPerSignature);

    return lamportsPerSignature;
  }
}
