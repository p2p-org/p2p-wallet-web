import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import type { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SYSTEM_INSTRUCTION_LAYOUTS } from '@solana/web3.js';

import type { Lamports } from '.';
import { FeeAmount, SolanaSDKPublicKey } from '.';

export interface FeeCalculator {
  calculateNetworkFee(transaction: Transaction, connection: Connection): Promise<FeeAmount>;
}

export class DefaultFeeCalculator implements FeeCalculator {
  private readonly _lamportsPerSignature: Lamports;
  private readonly _minRentExemption: Lamports;

  constructor({
    lamportsPerSignature,
    minRentExemption,
  }: {
    lamportsPerSignature: Lamports;
    minRentExemption: Lamports;
  }) {
    this._lamportsPerSignature = lamportsPerSignature;
    this._minRentExemption = minRentExemption;
  }

  async calculateNetworkFee(transaction: Transaction, connection: Connection): Promise<FeeAmount> {
    transaction.recentBlockhash = 'BdA9gRatFvvwszr9uU5fznkHoMVQE8tf6ZFi8Mp6xdKs'; // fake for estimate
    const transactionFee = new u64((await transaction.getEstimatedFee(connection)) ?? 0);
    let accountCreationFee: Lamports = ZERO;
    let depositFee: Lamports = ZERO;
    for (const instruction of transaction.instructions) {
      let createdAccount: PublicKey | null = null;
      switch (instruction.programId.toString()) {
        case SolanaSDKPublicKey.programId.toString(): {
          if (instruction.data.length < 4) {
            break;
          }
          const index = instruction.data.readUIntBE(0, 3); // TODO: check its right
          if (index === SYSTEM_INSTRUCTION_LAYOUTS.Create.index) {
            createdAccount = instruction.keys[1]?.pubkey ?? null;
          }
          break;
        }
        case SolanaSDKPublicKey.splAssociatedTokenAccountProgramId.toString(): {
          createdAccount = instruction.keys[1]?.pubkey ?? null;
          break;
        }
        default:
          break;
      }

      if (createdAccount) {
        // Check if account is closed right after its creation
        // TODO: CHECK data[0] casting
        const closingInstruction = transaction.instructions.find(
          (transaction) =>
            transaction.data[0] === 9 &&
            transaction.keys[0]?.pubkey.toString() === createdAccount!.toString(),
        );
        const isAccountClosedAfterCreation = Boolean(closingInstruction);

        // If account is closed after creation, increase the deposit fee
        if (isAccountClosedAfterCreation) {
          depositFee = new u64(depositFee.add(this._lamportsPerSignature));
        }
        // Otherwise, there will be an account creation fee
        else {
          accountCreationFee = new u64(accountCreationFee.add(this._minRentExemption));
        }
      }
    }

    return new FeeAmount({
      transaction: transactionFee,
      accountBalances: accountCreationFee,
      deposit: depositFee,
    });
  }
}
