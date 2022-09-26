import type { Provider } from '@project-serum/anchor';
import { networkToChainId } from '@saberhq/token-utils';
import { Token as SPLToken, u64 } from '@solana/spl-token';
import { TokenListProvider } from '@solana/spl-token-registry';
import type {
  AccountInfo as BufferInfo,
  Commitment,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';

import type { APIEndpoint, FeeCalculator, Lamports, TransactionID } from './';
import {
  AccountInfo,
  AccountInstructions,
  DefaultFeeCalculator,
  EmptyInfo,
  getAssociatedTokenAddressSync,
  LogEvent,
  Logger,
  MintInfo,
  PreparedTransaction,
  SolanaSDKError,
  SolanaSDKPublicKey,
  SPLTokenDestinationAddress,
  Token,
  TokenAccountBalance,
  Wallet,
} from './';

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
  }): Promise<BufferInfo<T> | null> {
    const pubkey = new PublicKey(account);
    return this.provider.connection.getAccountInfo(pubkey).then((info) => {
      if (!info) {
        return null;
        // throw SolanaSDKError.couldNotRetrieveAccountInfo();
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

  async getTokenAccountBalance(
    tokenAddress: string,
    commitment?: Commitment,
  ): Promise<TokenAccountBalance> {
    const result = await this.provider.connection.getTokenAccountBalance(
      new PublicKey(tokenAddress),
      commitment,
    );
    if (!result.value.amount) {
      throw SolanaSDKError.couldNotRetrieveAccountInfo();
    }
    return new TokenAccountBalance(result.value);
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
        if (!info) {
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
    owner,
    instructions,
    signers = [],
    feePayer,
    feeCalculator,
  }: {
    owner: PublicKey;
    instructions: TransactionInstruction[];
    signers?: Signer[];
    feePayer: PublicKey;
    feeCalculator?: FeeCalculator;
  }): Promise<PreparedTransaction> {
    // form transaction
    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.feePayer = feePayer;

    let feeCalculatorNew: FeeCalculator;
    if (feeCalculator) {
      feeCalculatorNew = feeCalculator;
    } else {
      const lps = new u64(
        (await this.provider.connection.getRecentBlockhash()).feeCalculator.lamportsPerSignature,
      );
      const minRentExemption = new u64(
        await this.getMinimumBalanceForRentExemption(AccountInfo.span),
      ); // 165
      const lamportsPerSignature = lps ?? new u64(5000);
      feeCalculatorNew = new DefaultFeeCalculator({
        lamportsPerSignature,
        minRentExemption,
      });
    }
    const expectedFee = await feeCalculatorNew.calculateNetworkFee(
      transaction,
      this.provider.connection,
    );

    const blockhash = await this.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;

    // resign transaction
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    const signedTransaction = await this.provider.wallet.signTransaction(transaction);

    return new PreparedTransaction({
      owner,
      transaction: signedTransaction,
      signers,
      expectedFee,
    });
  }

  /// Send preparedTransaction
  /// - Parameter preparedTransaction: preparedTransaction to be sent
  /// - Returns: Transaction signature
  async sendTransaction({
    preparedTransaction,
  }: {
    preparedTransaction: PreparedTransaction;
  }): Promise<string> {
    const maxAttemps = 3;
    let numberOfTries = 0;

    try {
      const recentBlockhash = await this.getRecentBlockhash();
      const serializedTransaction = this.signAndSerialize({
        preparedTransaction,
        recentBlockhash,
      });
      return this.provider.connection.sendEncodedTransaction(serializedTransaction);
    } catch (error) {
      if (numberOfTries <= maxAttemps) {
        let shouldRetry = false;
        if ((error as Error).message.includes('Blockhash not found')) {
          shouldRetry = true;
        }

        if (shouldRetry) {
          numberOfTries += 1;
          return this.sendTransaction({ preparedTransaction });
        }
      }
      throw error;
    }
  }

  signAndSerialize({
    preparedTransaction,
    recentBlockhash,
  }: {
    preparedTransaction: PreparedTransaction;
    recentBlockhash: string;
  }): string {
    const preparedTransactionNew = preparedTransaction;
    preparedTransactionNew.transaction.recentBlockhash = recentBlockhash;
    preparedTransactionNew.sign();
    return preparedTransactionNew.serialize();
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

  /// Traditional sending without FeeRelayer
  /// - Parameters:
  ///   - instructions: transaction's instructions
  ///   - recentBlockhash: recentBlockhash
  ///   - signers: signers
  ///   - isSimulation: define if this is a simulation or real transaction
  /// - Returns: transaction id
  serializeAndSendTraditional({
    instructions,
    recentBlockhash = null,
    signers,
    isSimulation,
  }: {
    instructions: TransactionInstruction[];
    recentBlockhash?: string | null;
    signers?: Signer[];
    isSimulation: boolean;
  }): Promise<TransactionID> {
    const maxAttemps = 3;
    let numberOfTries = 0;
    return this.serializeTransaction({
      instructions,
      recentBlockhash,
      signers,
    })
      .then((transaction) => {
        if (isSimulation) {
          // transfrom serialized tx to Transaction class
          const restoredTransaction = Transaction.from(Buffer.from(transaction, 'base64'));
          // simulate
          return this.provider.connection
            .simulateTransaction(restoredTransaction)
            .then((result) => {
              if (result.value.err) {
                throw Error('Simulation error');
              }

              return 'simulated transaction id';
            });
        } else {
          return this.provider.connection.sendEncodedTransaction(transaction);
        }
      })
      .catch((error: Error) => {
        if (numberOfTries <= maxAttemps) {
          let shouldRetry = false;
          if (error.message.includes('Blockhash not found')) {
            shouldRetry = true;
          }

          if (shouldRetry) {
            numberOfTries += 1;
            return this.serializeAndSendTraditional({ instructions, signers, isSimulation });
          }
        }
        throw error;
      });
  }

  serializeTransaction({
    instructions,
    recentBlockhash = null,
    signers = [],
    feePayer = null,
  }: {
    instructions: TransactionInstruction[];
    recentBlockhash?: string | null;
    signers?: Signer[];
    feePayer?: PublicKey | null;
  }): Promise<string> {
    // get recentBlockhash
    let getRecentBlockhashRequest: Promise<string>;
    if (recentBlockhash) {
      getRecentBlockhashRequest = Promise.resolve(recentBlockhash);
    } else {
      getRecentBlockhashRequest = this.getRecentBlockhash();
    }

    const _feePayer = feePayer ?? this.provider.wallet.publicKey;
    if (!feePayer) {
      // TODO: custom error wrapper
      throw SolanaSDKError.invalidRequest('Fee-payer not found');
    }

    // serialize transaction
    return getRecentBlockhashRequest.then(async (_recentBlockhash) => {
      const transaction = new Transaction();
      transaction.instructions = instructions;
      transaction.feePayer = _feePayer;
      transaction.recentBlockhash = _recentBlockhash;
      transaction.partialSign(...signers);
      const signedTransaction = await this.provider.wallet.signTransaction(transaction);
      const serializedTransaction = signedTransaction.serialize().toString('base64');

      const decodedTransaction = transaction;
      Logger.log(decodedTransaction, LogEvent.info);
      Logger.log(serializedTransaction, LogEvent.info);

      return serializedTransaction;
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
      .then((minRentExemption) => {
        // create new account
        const newAccount = new Keypair();

        return new AccountInstructions({
          account: newAccount.publicKey,
          instructions: [
            SystemProgram.createAccount({
              fromPubkey: owner,
              newAccountPubkey: newAccount.publicKey,
              lamports: amount.addn(minRentExemption).toNumber(),
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

    let isAssociatedTokenAddressRegistered: boolean;
    try {
      const info: BufferInfo<AccountInfo | null> | null = await this.getAccountInfo({
        account: associatedAddress.toString(),
        decodedTo: AccountInfo,
      });

      if (
        info?.owner.toString() === SolanaSDKPublicKey.tokenProgramId.toString() &&
        info?.data?.owner.toString() === owner.toString()
      ) {
        isAssociatedTokenAddressRegistered = true;
      } else {
        throw Error('Associated token account is belong to another user');
      }
    } catch (error) {
      console.error(error);
      // TODO: check error
      // associated address is not available
      if (error === SolanaSDKError.couldNotRetrieveAccountInfo()) {
        isAssociatedTokenAddressRegistered = false;
      } else {
        throw error;
      }
    }

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
    if (isAssociatedTokenAddressRegistered) {
      return new AccountInstructions({
        account: associatedAddress,
        cleanupInstructions: [],
      });
    }

    // / else create associated address
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
  }

  // SolanaSDKSend

  /// Create prepared transaction for sending SOL
  /// - Parameters:
  ///   - account
  ///   - destination: destination wallet address
  ///   - amount: amount in lamports
  ///   - feePayer: custom fee payer, can be omited if the authorized user is the payer
  /// - Returns: PreparedTransaction, can be send either directly or via custom fee relayer
  async prepareSendingNativeSOL({
    account,
    destination,
    amount,
    feePayer,
  }: {
    account: PublicKey;
    destination: string;
    amount: u64;
    feePayer?: PublicKey | null;
  }): Promise<PreparedTransaction> {
    const feePayerNew = feePayer ?? account;
    const fromPublicKey = account;

    if (fromPublicKey.toString() === destination) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    let accountInfo: BufferInfo<EmptyInfo> | null = null;
    try {
      accountInfo = await this.getAccountInfo({
        account: destination,
        decodedTo: EmptyInfo,
      });
      if (accountInfo?.owner.toString() !== SolanaSDKPublicKey.programId.toString()) {
        throw SolanaSDKError.other('Invalid account info');
      }
    } catch (error) {
      console.error(error);
      if (error === SolanaSDKError.couldNotRetrieveAccountInfo()) {
        // ignoring error
        accountInfo = null;
      } else {
        throw error;
      }
    }

    // form instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: new PublicKey(destination),
      lamports: amount.toNumber(),
    });

    return this.prepareTransaction({
      owner: account, // instead of signers with owner
      instructions: [instruction],
      feePayer: feePayerNew,
    });
  }

  /// Create prepared transaction for sending SPL token
  async prepareSendingSPLTokens({
    account,
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
    account: PublicKey;
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
    const feePayerNew = feePayer ?? account;

    // let minRentExemptionNew: Lamports;
    // if (minRentExemption) {
    //   minRentExemptionNew = minRentExemption;
    // } else {
    //   minRentExemptionNew = await this.getMinimumBalanceForRentExemption(AccountInfo.span);
    // }
    const splDestination = await this.findSPLTokenDestinationAddress({
      mintAddress,
      destinationAddress,
    });

    // get address
    const toPublicKey = splDestination.destination;

    // catch error
    if (fromPublicKey === toPublicKey.toString()) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    const fromPublicKeyNew = new PublicKey(fromPublicKey);

    const instructions: TransactionInstruction[] = [];

    // create associated token address
    // let accountsCreationFee: u64 = ZERO;
    if (splDestination.isUnregisteredAsocciatedToken) {
      const mint = new PublicKey(mintAddress);
      const ownerNew = new PublicKey(destinationAddress);

      const associatedAccount = getAssociatedTokenAddressSync(mint, ownerNew);
      const createATokenInstruction = SPLToken.createAssociatedTokenAccountInstruction(
        SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
        SolanaSDKPublicKey.tokenProgramId,
        mint,
        associatedAccount,
        ownerNew,
        feePayerNew,
      );
      instructions.push(createATokenInstruction);
      // TODO: why not using?
      // accountsCreationFee = accountsCreationFee.sub(minRentExemptionNew);
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
        splDestination.destination,
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
    if (!splDestination.isUnregisteredAsocciatedToken) {
      realDestination = splDestination.destination.toString();
    }

    // if not, serialize and send instructions normally
    const preparedTransaction = await this.prepareTransaction({
      owner: this.provider.wallet.publicKey, // instead of signers with owner
      instructions,
      feePayer: feePayerNew,
    });

    return {
      preparedTransaction,
      realDestination,
    };
  }

  // Helpers

  async findSPLTokenDestinationAddress({
    mintAddress,
    destinationAddress,
  }: {
    mintAddress: string;
    destinationAddress: string;
  }): Promise<SPLTokenDestinationAddress> {
    let address: string;
    let accountInfo: BufferInfo<AccountInfo | null> | null = null;
    try {
      accountInfo = await this.getAccountInfoThrowable({
        account: destinationAddress,
        decodedTo: AccountInfo,
      });
      const toTokenMint = accountInfo?.data?.mint.toString();
      // detect if destination address is already a SPLToken address
      if (mintAddress === toTokenMint) {
        address = destinationAddress;
      }
      // detect if destination address is a SOL address
      else if (accountInfo?.owner.toString() === SolanaSDKPublicKey.programId.toString()) {
        const owner = new PublicKey(destinationAddress);
        const tokenMint = new PublicKey(mintAddress);
        // create associated token address
        address = getAssociatedTokenAddressSync(tokenMint, owner).toString();
      } else {
        throw SolanaSDKError.invalidRequest('Wallet address is not valid');
      }
    } catch (error) {
      console.error(error, accountInfo, destinationAddress);
      // TODO: check its work
      if (SolanaSDKError.equals(error as Error, SolanaSDKError.couldNotRetrieveAccountInfo())) {
        const owner = new PublicKey(destinationAddress);
        const tokenMint = new PublicKey(mintAddress);

        // create associated token address
        address = getAssociatedTokenAddressSync(tokenMint, owner).toString();
      } else {
        throw error;
      }
    }

    // address needs here
    const toPublicKey = new PublicKey(address);
    // if destination address is an SOL account address
    let isUnregisteredAsocciatedToken = false;
    if (destinationAddress !== toPublicKey.toString()) {
      // check if associated address is already registered
      let info: BufferInfo<AccountInfo | null> | null = null;
      try {
        info = await this.getAccountInfoThrowable({
          account: toPublicKey.toString(),
          decodedTo: AccountInfo,
        });
      } catch {
        info = null;
      }
      isUnregisteredAsocciatedToken = true;

      // if associated token account has been registered
      if (info?.owner.toString() === SolanaSDKPublicKey.tokenProgramId.toString()) {
        isUnregisteredAsocciatedToken = false;
      }
    }

    return new SPLTokenDestinationAddress({
      destination: toPublicKey,
      isUnregisteredAsocciatedToken,
    });
  }

  // SolanaSDKCreateTokenAccount

  getCreatingTokenAccountFee(): Promise<u64> {
    return this.getMinimumBalanceForRentExemption(AccountInfo.span);
  }

  // SolanaSDKClose
  closeTokenAccount({
    // account = null,
    tokenPubkey,
    isSimulation = false,
  }: {
    // account: string;
    tokenPubkey: string;
    isSimulation?: boolean;
  }): Promise<TransactionID> {
    const account = this.provider.wallet.publicKey;
    if (!account) {
      throw SolanaSDKError.unauthorized();
    }

    const _tokenPubkey = new PublicKey(tokenPubkey);

    const instruction = SPLToken.createCloseAccountInstruction(
      SolanaSDKPublicKey.tokenProgramId,
      _tokenPubkey,
      account,
      account,
      [],
    );

    // TOOD: custom error wrapper
    return this.serializeAndSendTraditional({
      instructions: [instruction],
      isSimulation,
    });
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
            serumV3Usdc: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
            coingeckoId: 'renbtc',
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

  async getTokenWallets(account: string): Promise<Wallet[]> {
    const knownWallets: Wallet[] = [];
    const unknownAccounts: [string, AccountInfo][] = [];

    const [list, supportedTokens] = await Promise.all([
      this.provider.connection.getTokenAccountsByOwner(new PublicKey(account), {
        programId: SolanaSDKPublicKey.tokenProgramId,
      }),
      this.getTokensList(),
    ]);

    for (const item of list.value) {
      const pubkey = item.pubkey;
      const accountInfo = AccountInfo.decode(item.account.data)!;

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

  // TODO: check
  /// Returns all information associated with the account of provided Pubkey
  /// - Parameters:
  ///  - account: Pubkey of account to query, as base-58 encoded string
  /// - Throws: APIClientError and SolanaError.couldNotRetrieveAccountInfo
  /// - Returns The result will be an BufferInfo
  /// - SeeAlso https://docs.solana.com/developing/clients/jsonrpc-api#getaccountinfo
  async getAccountInfoThrowable<T>({
    account,
    decodedTo,
  }: {
    account: string;
    decodedTo: { decode(data: Buffer): T };
  }): Promise<BufferInfo<T>> {
    let info: BufferInfo<T> | null = null;
    try {
      info = await this.getAccountInfo({
        account,
        decodedTo,
      });
    } catch {
      //
    }
    if (!info) {
      throw SolanaSDKError.couldNotRetrieveAccountInfo();
    }
    return info;
  }
}
