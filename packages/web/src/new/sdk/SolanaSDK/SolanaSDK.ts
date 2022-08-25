import { ZERO } from '@orca-so/sdk';
import type { Provider } from '@project-serum/anchor';
import { networkToChainId } from '@saberhq/token-utils';
import { Token as SPLToken, u64 } from '@solana/spl-token';
import { TokenListProvider } from '@solana/spl-token-registry';
import type {
  AccountInfo as BufferInfo,
  Commitment,
  RpcResponseAndContext,
  Signer,
  TokenAmount,
  TransactionInstruction,
} from '@solana/web3.js';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';

import type { APIEndpoint, Lamports } from './index';
import {
  AccountInfo,
  AccountInstructions,
  EmptyInfo,
  FeeAmount,
  MintInfo,
  PreparedTransaction,
  SolanaSDKError,
  SolanaSDKPublicKey,
  SPLTokenDestinationAddress,
  Token,
  Wallet,
} from './index';

// export interface SolanaSDKAccountStorage {
//   readonly account?: Account;
//   save(account: Account): void;
// }

export class SolanaSDK {
  // Properties
  provider: Provider;
  // accountStorage: SolanaSDKAccountStorage;
  endpoint: APIEndpoint;
  supportedTokensCache?: Token[];

  constructor({
    provider,
    endpoint,
  }: // accountStorage,
  {
    provider: Provider;
    endpoint: APIEndpoint;
    // accountStorage: SolanaSDKAccountStorage;
  }) {
    this.provider = provider;
    this.endpoint = endpoint;
    // this.accountStorage = accountStorage;
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

  async getMultipleAccounts<T>({
    pubkeys,
    decodedTo,
  }: {
    pubkeys: string[];
    decodedTo: { decode(data: Buffer): T };
  }): Promise<(BufferInfo<T> | null)[]> {
    if (pubkeys.length === 0) {
      return Promise.resolve([]);
    }

    const pubkeysNew = pubkeys.map((pubkey) => new PublicKey(pubkey));
    return (await this.provider.connection.getMultipleAccountsInfo(pubkeysNew)).map((info) => {
      if (!info) {
        return null;
      }

      return {
        ...info,
        data: decodedTo.decode(info.data),
      };
    });
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

  getMultipleMintDatas({
    mintAddresses,
    programId = SolanaSDKPublicKey.tokenProgramId.toString(),
  }: {
    mintAddresses: string[];
    programId?: string;
  }): Promise<(MintInfo | null)[]> {
    return this.getMultipleAccounts<MintInfo>({
      pubkeys: mintAddresses,
      decodedTo: MintInfo,
    }).then((accounts) => {
      if (accounts.some((account) => account?.owner.toString() !== programId)) {
        throw SolanaSDKError.other('Invalid mint owner');
      }

      const result = accounts.map((account) => account?.data ?? null);
      if (result.length !== mintAddresses.length) {
        throw SolanaSDKError.other('Some of mint data are missing');
      }

      return result;
    });
  }

  async checkIfAssociatedTokenAccountExists(owner: PublicKey, mint: string): Promise<boolean> {
    const mintAddress = new PublicKey(mint);

    const associatedTokenAccount = await SPLToken.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
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
      .catch((error) => {
        if (error === SolanaSDKError.couldNotRetrieveAccountInfo()) {
          return false;
        }

        throw error;
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
      getRecentBlockhashRequest = Promise.resolve(
        (await this.provider.connection.getRecentBlockhash()).blockhash,
      );
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
      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }

      const signedTransaction = await this.provider.wallet.signTransaction(transaction);

      return new PreparedTransaction({
        transaction: signedTransaction,
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
      .getMinimumBalanceForRentExemption(AccountInfo.span)
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
              space: AccountInfo.span,
              programId: SolanaSDKPublicKey.tokenProgramId,
            }),
            SPLToken.createInitAccountInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              SolanaSDKPublicKey.wrappedSOLMint,
              newAccount.publicKey,
              payer,
            ),
          ],
          cleanupInstructions: [
            SPLToken.createCloseAccountInstruction(
              SolanaSDKPublicKey.tokenProgramId,
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
    const associatedAddress = await SPLToken.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
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
            accountInfo.owner.equals(SolanaSDKPublicKey.tokenProgramId) &&
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
              SPLToken.createCloseAccountInstruction(
                SolanaSDKPublicKey.tokenProgramId,
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
              SPLToken.createAssociatedTokenAccountInstruction(
                SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
                SolanaSDKPublicKey.tokenProgramId,
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

  /// Create prepared transaction for sending SOL
  /// - Parameters:
  ///   - destination: destination wallet address
  ///   - amount: amount in lamports
  ///   - feePayer: customm fee payer, can be omited if the authorized user is the payer
  /// - Returns: PreparedTransaction, can be send either directly or via custom fee relayer
  prepareSendingNativeSOL({
    destination,
    amount,
    feePayer,
    recentBlockhash,
  }: {
    destination: string;
    amount: u64;
    feePayer?: PublicKey | null;
    recentBlockhash?: string;
  }): Promise<PreparedTransaction> {
    const account = this.provider.wallet.publicKey;

    const feePayerNew = feePayer ?? account;
    const fromPublicKey = account;

    if (fromPublicKey.toString() === destination) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    // check
    return this.getAccountInfo({
      account: destination,
      decodedTo: EmptyInfo,
    })
      .then((info) => {
        if (!info.owner.equals(SolanaSDKPublicKey.programId)) {
          throw SolanaSDKError.other('Invalid account info');
        }
        return;
      })
      .catch((error) => {
        if (error === SolanaSDKError.couldNotRetrieveAccountInfo()) {
          // let request through
          return;
        }
        throw error;
      })
      .then(() => {
        // form instruction
        const instruction = SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: new PublicKey(destination),
          lamports: amount.toNumber(),
        });

        return this.prepareTransaction({
          instructions: [instruction],
          signers: [
            /* account */
          ],
          feePayer: feePayerNew,
          accountsCreationFee: ZERO,
          recentBlockhash,
        });
      });
  }

  /// Create prepared transaction for sending SPL token
  prepareSendingSPLTokens({
    mintAddress,
    decimals,
    fromPublicKey,
    destinationAddress,
    amount,
    feePayer,
    transferChecked,
    recentBlockhash,
    minRentExemption,
  }: {
    mintAddress: string;
    decimals: number;
    fromPublicKey: string;
    destinationAddress: string;
    amount: u64;
    feePayer?: PublicKey | null;
    transferChecked?: boolean;
    recentBlockhash?: string;
    minRentExemption?: Lamports;
  }): Promise<{
    preparedTransaction: PreparedTransaction;
    realDestination: string;
  }> {
    const account = this.provider.wallet.publicKey;

    const feePayerNew = feePayer ?? account;

    let minRentExemptionRequest: Promise<Lamports>;
    if (minRentExemption) {
      minRentExemptionRequest = Promise.resolve(minRentExemption);
    } else {
      minRentExemptionRequest = this.getMinimumBalanceForRentExemption(AccountInfo.span);
    }

    // Request
    return Promise.all([
      this.findSPLTokenDestinationAddress({
        mintAddress,
        destinationAddress,
      }),
      minRentExemptionRequest,
    ]).then(([splDestinationAddress, minRentExempt]) => {
      // get address
      const toPublicKey = splDestinationAddress.destination;

      // catch error
      if (fromPublicKey === toPublicKey.toString()) {
        throw SolanaSDKError.other('You can not send tokens to yourself');
      }

      const fromPublicKeyNew = new PublicKey(fromPublicKey);

      const instructions: TransactionInstruction[] = [];

      // create associated token address
      let accountsCreationFee: u64 = ZERO;
      if (splDestinationAddress.isUnregisteredAsocciatedToken) {
        const mint = new PublicKey(mintAddress);
        const ownerNew = new PublicKey(destinationAddress);

        const createATokenInstruction = SPLToken.createAssociatedTokenAccountInstruction(
          SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
          SolanaSDKPublicKey.tokenProgramId,
          mint,
          toPublicKey,
          ownerNew,
          feePayerNew,
        );
        instructions.push(createATokenInstruction);
        accountsCreationFee = accountsCreationFee.sub(minRentExempt);
      }

      // send instruction
      let sendInstruction: TransactionInstruction;

      // use transfer checked transaction for proxy, otherwise use normal transfer transaction
      if (transferChecked) {
        // transfer checked transaction
        sendInstruction = SPLToken.createTransferCheckedInstruction(
          SolanaSDKPublicKey.tokenProgramId,
          fromPublicKeyNew,
          new PublicKey(mintAddress),
          splDestinationAddress.destination,
          account,
          [],
          amount,
          decimals,
        );
      } else {
        // transfer transaction
        sendInstruction = SPLToken.createTransferInstruction(
          SolanaSDKPublicKey.tokenProgramId,
          fromPublicKeyNew,
          toPublicKey,
          account,
          [],
          amount,
        );
      }

      instructions.push(sendInstruction);

      let realDestination = destinationAddress;
      if (!splDestinationAddress.isUnregisteredAsocciatedToken) {
        realDestination = splDestinationAddress.destination.toString();
      }

      // if not, serialize and send instructions normally
      return this.prepareTransaction({
        instructions,
        signers: [
          /* account */
        ],
        feePayer: feePayerNew,
        accountsCreationFee,
        recentBlockhash,
      }).then((preparedTransaction) => ({
        preparedTransaction,
        realDestination,
      }));
    });
  }

  // Helpers

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
        if (info.owner.equals(SolanaSDKPublicKey.programId)) {
          const owner = new PublicKey(destinationAddress);
          const tokenMint = new PublicKey(mintAddress);

          // create associated token address
          const address = await SPLToken.getAssociatedTokenAddress(
            SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
            SolanaSDKPublicKey.tokenProgramId,
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
          const address = await SPLToken.getAssociatedTokenAddress(
            SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
            SolanaSDKPublicKey.tokenProgramId,
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

  // SolanaSDKCreateTokenAccount

  getCreatingTokenAccountFee(): Promise<u64> {
    return this.getMinimumBalanceForRentExemption(AccountInfo.span);
  }

  // SolanaSDKTokens

  // TODo: external parser
  async getTokensList(): Promise<Token[]> {
    const cache = this.supportedTokensCache;
    if (cache) {
      return Promise.resolve(cache);
    }

    const tokenList = await new TokenListProvider().resolve();

    // map tags
    const tokens = tokenList
      .getList()
      .filter((token) => token.chainId === networkToChainId(this.endpoint.network))
      .map((item) => {
        return new Token(item);
      });

    // renBTC for devnet
    if (this.endpoint.network === 'devnet') {
      tokens.push(
        new Token({
          chainId: 101,
          address: 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD',
          symbol: 'renBTC',
          name: 'renBTC',
          decimals: 8,
          logoURI:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5/logo.png',
          extensions: {
            website: 'https://renproject.io/',
            bridgeContract: null,
            assetContract: null,
            address: null,
            explorer: null,
            twitter: null,
            github: null,
            medium: null,
            tgann: null,
            tggroup: null,
            discord: null,
            serumV3Usdt: null,
            serumV3Usdc: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
            coingeckoId: 'renbtc',
            imageUrl: null,
            description: null,
          },
        }),
      );
    }

    this.supportedTokensCache = tokens;

    return Promise.resolve(tokens);
  }

  getToken(mint: string): Promise<Token | undefined> {
    return this.getTokensList().then((tokensList) =>
      tokensList.find((token) => token.address === mint),
    );
  }

  getTokenWallets(account: string): Promise<Wallet[]> {
    return Promise.all([
      this.provider.connection.getTokenAccountsByOwner(new PublicKey(account), {
        programId: SolanaSDKPublicKey.tokenProgramId,
      }),
      this.getTokensList(),
    ]).then(([list, supportedTokens]): Promise<Wallet[]> => {
      const knownWallets: Wallet[] = [];
      const unknownAccounts: [string, AccountInfo][] = [];

      for (const item of list.value) {
        const pubkey = item.pubkey;
        const accountInfo = AccountInfo.decode(item.account.data);

        const mintAddress = accountInfo.mint.toString();
        // known token
        const token = supportedTokens.find(
          (supportedToken) => supportedToken.address === mintAddress,
        );
        if (token) {
          knownWallets.push(
            new Wallet({
              pubkey: pubkey.toString(),
              lamports: accountInfo.amount,
              token,
            }),
          );
        }
        // unknown token
        else {
          unknownAccounts.push([item.pubkey.toString(), accountInfo]);
        }
      }

      return this.getMultipleMintDatas({
        mintAddresses: unknownAccounts.map((account) => account[1].mint.toString()),
      })
        .then((mintDatas): Wallet[] => {
          if (Object.keys(mintDatas).length !== unknownAccounts.length) {
            throw SolanaSDKError.unknown();
          }

          const wallets: Wallet[] = [];
          for (const [index, item] of mintDatas.entries()) {
            wallets.push(
              new Wallet({
                pubkey: unknownAccounts[index]![0],
                lamports: unknownAccounts[index]![1].amount,
                token: Token.unsupported({
                  mint: unknownAccounts[index]![1].mint.toString(),
                  decimals: item?.decimals,
                }),
              }),
            );
          }

          return wallets;
        })
        .catch(() => {
          return unknownAccounts.map(
            (account) =>
              new Wallet({
                pubkey: account[0],
                lamports: account[1].amount,
                token: Token.unsupported({
                  mint: account[1].mint.toString(),
                }),
              }),
          );
        })
        .then((wallets) => knownWallets.concat(wallets));
    });
  }

  checkAccountValidation(account: string): Promise<boolean> {
    return this.getAccountInfo({
      account,
      decodedTo: EmptyInfo,
    })
      .then(() => true)
      .catch((error: Error) => {
        if (error.message === SolanaSDKError.couldNotRetrieveAccountInfo().message) {
          return false;
        }

        throw error;
      });
  }
}
