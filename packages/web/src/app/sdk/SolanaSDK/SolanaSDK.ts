import type { SolanaProvider } from '@saberhq/solana-contrib';
import { AccountLayout, Token, u64 } from '@solana/spl-token';
import type {
  Account,
  AccountInfo as BufferInfo,
  Commitment,
  RpcResponseAndContext,
  Signer,
  TokenAmount,
  TransactionInstruction,
} from '@solana/web3.js';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';

import type { APIEndpoint, Lamports } from './';
import {
  AccountInfo,
  AccountInstructions,
  FeeAmount,
  PreparedTransaction,
  SolanaSDKError,
  SolanaSDKPublicKey,
  SPLTokenDestinationAddress,
} from './';

export interface SolanaSDKAccountStorage {
  readonly account?: Account;
  save(account: Account): void;
}

export class SolanaSDK {
  // Properties
  provider: SolanaProvider;
  accountStorage: SolanaSDKAccountStorage;
  endpoint: APIEndpoint;
  supportedTokensCache?: Token[];

  constructor({
    provider,
    endpoint,
    accountStorage,
  }: {
    provider: SolanaProvider;
    endpoint: APIEndpoint;
    accountStorage: SolanaSDKAccountStorage;
  }) {
    this.provider = provider;
    this.endpoint = endpoint;
    this.accountStorage = accountStorage;
  }

  // SolanaSDKMethods

  getAccountInfo<T>({
    account,
    decodedTo,
  }: {
    account: string;
    decodedTo: { decode(data: Buffer): T };
  }): Promise<BufferInfo<T>> {
    const pubkey = new PublicKey(account);
    return this.provider.connection.getAccountInfo(pubkey).then((info) => {
      if (!info) {
        throw SolanaSDKError.couldNotRetrieveAccountInfo();
      }

      return {
        ...info,
        data: decodedTo.decode(info.data),
      };
    });
  }

  async getMinimumBalanceForRentExemption(span: number): Promise<Lamports> {
    return new u64(await this.provider.connection.getMinimumBalanceForRentExemption(span));
  }

  async getRecentBlockhash(commitment?: Commitment): Promise<string> {
    return (await this.provider.connection.getRecentBlockhash(commitment)).blockhash;
  }

  getTokenAccountBalance(
    tokenAddress: PublicKey,
    commitment?: Commitment,
  ): Promise<RpcResponseAndContext<TokenAmount>> {
    return this.provider.connection.getTokenAccountBalance(tokenAddress, commitment);
  }

  // TODO: test it
  waitForConfirmation(signature: string): Promise<void> {
    let partiallyConfirmed = false;
    // Due to a bug (https://github.com/solana-labs/solana/issues/15461)
    // the `confirmationStatus` field could be unpopulated.
    // To handle this case, also check the `confirmations` field.
    // Note that a `null` value for `confirmations` signals that the
    // transaction was finalized.

    return promiseRetry(
      (retry) => {
        return this.provider.connection
          .getSignatureStatus(signature)
          .then((status) => {
            const confirmations = status.value?.confirmations;
            if (confirmations && confirmations > 0) {
              partiallyConfirmed = true;
            }

            const confirmed =
              !status.value?.confirmations || status.value.confirmationStatus === 'finalized';
            if (confirmed) {
              return;
            }

            throw new Error('Status has not been confirmed');
          })
          .catch(retry);
      },
      {
        retries: 10,
        minTimeout: 1000,
        maxTimeout: 60000,
        factor: 1,
      },
    ).catch((err) => {
      if (partiallyConfirmed) {
        return;
      }

      throw err;
    });
  }

  async checkIfAssociatedTokenAccountExists(owner: PublicKey, mint: string): Promise<boolean> {
    const mintAddress = new PublicKey(mint);

    const associatedTokenAccount = await Token.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId(),
      SolanaSDKPublicKey.tokenProgramId(),
      mintAddress,
      owner,
    );

    return this.provider.connection
      .getAccountInfo(associatedTokenAccount)
      .then((info) => {
        if (info === null) {
          throw SolanaSDKError.couldNotRetrieveAccountInfo();
        }

        const accountInfo = info as unknown as BufferInfo<{ mint: string }>;
        // detect if destination address is already a SPLToken address
        if (accountInfo.data.mint === mint) {
          return true;
        }

        return false;
      })
      .catch((err) => {
        if (err === SolanaSDKError.couldNotRetrieveAccountInfo()) {
          return false;
        }

        throw err;
      });
  }

  // SolanaSDKActions

  async prepareTransaction({
    instructions,
    signers,
    feePayer,
    accountsCreationFee,
    recentBlockhash,
  }: // lamportsPerSignature,
  {
    instructions: TransactionInstruction[];
    signers: Signer[];
    feePayer: PublicKey;
    accountsCreationFee: Lamports;
    recentBlockhash?: string | null;
    // lamportsPerSignature?: Lamports | null;
  }): Promise<PreparedTransaction> {
    // get recentBlockhash
    let getRecentBlockhashRequest: Promise<string>;
    if (recentBlockhash) {
      getRecentBlockhashRequest = Promise.resolve(recentBlockhash);
    } else {
      getRecentBlockhashRequest = (await this.provider.connection.getLatestBlockhash()).blockhash;
    }

    // get lamports per signature
    // let getLamportsPerSignature: Promise<Lamports>;
    // if (lamportsPerSignature) {
    //   getLamportsPerSignature = Promise.resolve(lamportsPerSignature);
    // } else {
    //   getLamportsPerSignature = new u64(
    //     (await this.provider.connection.getRecentBlockhash()).feeCalculator.lamportsPerSignature,
    //   );
    // }

    return getRecentBlockhashRequest.then(async (recentBlockhashNew) => {
      const transaction = new Transaction();
      transaction.instructions = instructions;
      transaction.recentBlockhash = recentBlockhashNew;
      transaction.feePayer = feePayer;

      // calculate fee first
      const estimatedFee = await transaction.getEstimatedFee(this.provider.connection);
      const expectedFee = new FeeAmount({
        transaction: new u64(estimatedFee),
        accountBalances: accountsCreationFee,
      });

      // resign transaction
      transaction.sign(...signers);

      return new PreparedTransaction({
        transaction,
        signers,
        expectedFee,
      });
    });
  }

  serializeAndSend({
    preparedTransaction,
    isSimulation,
  }: {
    preparedTransaction: PreparedTransaction;
    isSimulation: boolean;
  }): Promise<string> {
    let request: Promise<string>;

    if (isSimulation) {
      request = this.provider.connection
        .simulateTransaction(preparedTransaction.transaction)
        .then((result) => {
          if (result.value.err) {
            throw Error('Simulation error');
          }

          return 'simulated transaction id';
        });
    } else {
      const serializedTransaction = preparedTransaction.serialize();
      request = this.provider.connection.sendEncodedTransaction(serializedTransaction);
    }

    const maxAttemps = 3;
    let numberOfTries = 0;
    return request.catch((error: Error) => {
      if (numberOfTries <= maxAttemps) {
        let shouldRetry = false;
        if (error.message.includes('Blockhash not found')) {
          shouldRetry = true;
        }

        if (shouldRetry) {
          numberOfTries += 1;
          return this.serializeAndSend({ preparedTransaction, isSimulation });
        }
      }
      throw error;
    });
  }

  // SolanaSDKSwap

  prepareCreatingWSOLAccountAndCloseWhenDone(
    owner: PublicKey,
    amount: Lamports,
    payer: PublicKey,
  ): Promise<AccountInstructions> {
    return this.provider.connection
      .getMinimumBalanceForRentExemption(AccountLayout.span)
      .then((minimumBalanceForRentExemption) => {
        // create new account
        const newAccount = new Keypair();

        return new AccountInstructions({
          account: newAccount.publicKey,
          instructions: [
            SystemProgram.createAccount({
              fromPubkey: owner,
              newAccountPubkey: newAccount.publicKey,
              lamports: amount.addn(minimumBalanceForRentExemption).toNumber(),
              space: AccountLayout.span,
              programId: SolanaSDKPublicKey.tokenProgramId(),
            }),
            Token.createInitAccountInstruction(
              SolanaSDKPublicKey.tokenProgramId(),
              SolanaSDKPublicKey.wrappedSOLMint(),
              newAccount.publicKey,
              payer,
            ),
          ],
          cleanupInstructions: [
            Token.createCloseAccountInstruction(
              SolanaSDKPublicKey.tokenProgramId(),
              newAccount.publicKey,
              payer,
              owner,
              [],
            ),
          ],
          signers: [newAccount],
          secretKey: newAccount.secretKey,
        });
      });
  }

  async prepareForCreatingAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey,
    feePayer: PublicKey,
    closeAfterward: boolean,
  ): Promise<AccountInstructions> {
    const associatedAddress = await Token.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId(),
      SolanaSDKPublicKey.tokenProgramId(),
      mint,
      owner,
    );

    return (
      this.provider.connection
        .getAccountInfo(associatedAddress)
        // check if associated address is registered
        .then((info) => {
          if (info === null) {
            throw SolanaSDKError.couldNotRetrieveAccountInfo();
          }

          const accountInfo = info as unknown as BufferInfo<{ owner: string }>;
          if (
            accountInfo.owner.equals(SolanaSDKPublicKey.tokenProgramId()) &&
            accountInfo.data.owner === owner.toString()
          ) {
            return true;
          }

          throw Error('Associated token account is belong to another user');
        })
        .catch((err) => {
          // associated address is not available
          if (err === SolanaSDKError.couldNotRetrieveAccountInfo()) {
            return false;
          }

          throw err;
        })
        .then((isRegistered) => {
          // cleanup intructions
          let cleanupInstructions: TransactionInstruction[] = [];
          if (closeAfterward) {
            cleanupInstructions = [
              Token.createCloseAccountInstruction(
                SolanaSDKPublicKey.tokenProgramId(),
                associatedAddress,
                owner,
                owner,
                [],
              ),
            ];
          }

          // if associated address is registered, there is no need to creating it again
          if (isRegistered) {
            return new AccountInstructions({
              account: associatedAddress,
              cleanupInstructions: [],
            });
          }

          // create associated address
          return new AccountInstructions({
            account: associatedAddress,
            instructions: [
              Token.createAssociatedTokenAccountInstruction(
                SolanaSDKPublicKey.splAssociatedTokenAccountProgramId(),
                SolanaSDKPublicKey.tokenProgramId(),
                mint,
                associatedAddress,
                owner,
                feePayer,
              ),
            ],
            cleanupInstructions,
            newWalletPubkey: associatedAddress.toString(),
          });
        })
    );
  }

  // SolanaSDKSend

  findSPLTokenDestinationAddress({
    mintAddress,
    destinationAddress,
  }: {
    mintAddress: string;
    destinationAddress: string;
  }): Promise<SPLTokenDestinationAddress> {
    return this.getAccountInfo({
      account: destinationAddress,
      decodedTo: AccountInfo,
    })
      .then(async (info) => {
        const toTokenMint = info.data.mint.toString();

        // detect if destination address is already a SPLToken address
        if (mintAddress === toTokenMint) {
          return destinationAddress;
        }

        // detect if destination address is a SOL address
        if (info.owner.equals(SolanaSDKPublicKey.programId())) {
          const owner = new PublicKey(destinationAddress);
          const tokenMint = new PublicKey(mintAddress);

          // create associated token address
          const address = await Token.getAssociatedTokenAddress(
            SolanaSDKPublicKey.splAssociatedTokenAccountProgramId(),
            SolanaSDKPublicKey.tokenProgramId(),
            tokenMint,
            owner,
          );
          return address.toString();
        }

        // token is of another type
        throw SolanaSDKError.invalidRequest('Wallet address is not valid');
      })
      .catch(async (error: Error) => {
        // let request through if result of getAccountInfo is null (it may be a new SOL address)
        if (SolanaSDKError.equals(error, SolanaSDKError.couldNotRetrieveAccountInfo())) {
          const owner = new PublicKey(destinationAddress);
          const tokenMint = new PublicKey(mintAddress);

          // create associated token address
          const address = await Token.getAssociatedTokenAddress(
            SolanaSDKPublicKey.splAssociatedTokenAccountProgramId(),
            SolanaSDKPublicKey.tokenProgramId(),
            tokenMint,
            owner,
          );
          return address.toString();
        }

        // throw another error
        throw error;
      })
      .then((toAddress) => {
        const toPublicKey = new PublicKey(toAddress);
        // if destination address is an SOL account address
        if (destinationAddress !== toPublicKey.toString()) {
          // check if associated address is already registered
          return this.getAccountInfo({
            account: toPublicKey.toString(),
            decodedTo: AccountInfo,
          })
            .catch(() => null)
            .then((info) => {
              let isUnregisteredAsocciatedToken = true;

              // if associated token account has been registered
              if (info?.owner) {
                isUnregisteredAsocciatedToken = false;
              }

              // if not, create one in next step
              return new SPLTokenDestinationAddress({
                destination: toPublicKey,
                isUnregisteredAsocciatedToken,
              });
            });
        }
        return new SPLTokenDestinationAddress({
          destination: toPublicKey,
          isUnregisteredAsocciatedToken: false,
        });
      });
  }
}
