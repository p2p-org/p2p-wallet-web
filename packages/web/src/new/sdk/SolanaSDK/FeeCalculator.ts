import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';
import { SYSTEM_INSTRUCTION_LAYOUTS, Transaction } from '@solana/web3.js';

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

  async calculateNetworkFee(transaction: Transaction, _connection: Connection): Promise<FeeAmount> {
    // TODO: return than works
    // const transactionFee = new u64((await transaction.getEstimatedFee(connection)) ?? 0);
    const transactionFee = calculateTransactionFee(transaction, this._lamportsPerSignature);
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

// TODO: temp, use getEstimatedFee instead
export function calculateTransactionFee(transaction: Transaction, lamportsPerSignatures: u64): u64 {
  const _transaction = new Transaction();
  _transaction.instructions = transaction.instructions;
  _transaction.recentBlockhash = 'BdA9gRatFvvwszr9uU5fznkHoMVQE8tf6ZFi8Mp6xdKs'; // fake
  _transaction.feePayer = transaction.feePayer;
  const message = _transaction.compileMessage();
  return new u64(message.header.numRequiredSignatures).mul(lamportsPerSignatures);
}
