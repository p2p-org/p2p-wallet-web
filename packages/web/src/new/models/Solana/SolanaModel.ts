/* eslint-disable no-console */
import { Provider, web3 } from '@project-serum/anchor';
import type { u64 } from '@solana/spl-token';
import type {
  Blockhash,
  Commitment,
  FeeCalculator,
  Keypair,
  PublicKey,
  SignatureStatus,
  Signer,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { get } from 'lodash';
import { delay, inject, singleton } from 'tsyringe';

import { DI_KEYS } from '../../core/Constants';
import { DependencyService } from '../../services/injection/DependencyContext';
import { Model } from '../Model';
import { WalletModel } from '../WalletModel/WalletModel';
import { SolanaInstructionService } from './SolanaInstructionService';
import type { BlockType } from './SolanaTransactionService';
import { DEFAULT_TIMEOUT, SolanaTransactionService } from './SolanaTransactionService';

export type TokenAccountInfo = {
  mintAddress: PublicKey;
  quantity: number;
};

@singleton()
export class SolanaModel extends Model {
  protected _provider: Provider | null = null;
  protected _connection: Connection | null = null;

  static readonly TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  );

  static readonly SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  );

  static readonly CIVIC = new web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs');

  constructor(
    protected walletModel: WalletModel,
    @inject(delay(() => SolanaInstructionService))
    protected readonly instructionService: Readonly<SolanaInstructionService>,
    @inject(delay(() => SolanaTransactionService))
    protected readonly transactionService: Readonly<SolanaTransactionService>,
  ) {
    super();
  }

  protected onInitialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.setUpConnection();
    this.setUpProvider();
  }

  protected afterReactionsRemoved() {
    this._provider = null;
    this._connection = null;
  }

  protected setUpConnection() {
    const rpcHost: string = DependencyService.resolve(DI_KEYS.SOLANA_RPC_HOST);
    if (!rpcHost) {
      throw new Error('~~~ No RPC Host provided by ENV');
    }

    this._connection = new Connection(rpcHost);
  }

  protected setUpProvider() {
    const conn = this.connection;
    const solana = get(window, 'solana');
    if (!solana) {
      throw new Error('~~~ No Solana Object found on window');
    }
    this._provider = new Provider(conn, solana, Provider.defaultOptions());
  }

  get connection(): Connection {
    if (!this._connection) {
      this.setUpConnection();
    }

    return this._connection as Connection;
  }

  get provider(): Provider {
    if (!this._provider) {
      this.setUpProvider();
    }

    return this._provider as Provider;
  }

  async confirmTransaction(
    txId: string,
    cb: null | ((msg: string) => void) = null,
    maxTries = 10,
    index = 0,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const msg = `~~~ confirming tx ${txId} attempt: ${index}`;
        console.log(msg);
        const confirmed = await this.connection.getConfirmedTransaction(txId, 'finalized');
        if (cb) {
          cb(msg);
        }
        if (!!confirmed && index <= maxTries) {
          if (cb) {
            cb(`~~~ tx ${txId} did not confirm`);
          }
          return resolve(this.confirmTransaction(txId, cb, maxTries, ++index));
        } else {
          if (cb) {
            cb(`~~~ tx ${txId} confirmed? ${confirmed ? 'TRUE' : 'FALSE'}`);
          }
          return resolve(!!confirmed);
        }
      } catch (e: any) {
        if (cb) {
          cb(`~~~ error confirming tx ${txId} ${e.toString()}`);
        }
        reject(e);
      }
    });
  }

  async getAssociatedTokenAccountForToken(
    tokenMintAddress: PublicKey,
    buyersAddress: PublicKey,
  ): Promise<TokenAccountInfo> {
    return this.instructionService.getAssociatedTokenAccountForToken(
      tokenMintAddress,
      buyersAddress,
    );
  }

  async getAssociatedTokenAccountAddressForToken(
    tokenMintAddress: PublicKey,
    buyersAddress: PublicKey,
  ): Promise<PublicKey> {
    return this.instructionService.getAssociatedTokenAccountAddressForToken(
      tokenMintAddress,
      buyersAddress,
    );
  }

  createInitMintInstructionForUsersPublicKey(
    tokenMintAddress: PublicKey,
    mintAuthorityAddress: PublicKey,
    freezeAuthorityAddress: PublicKey,
    decimals = 6,
  ): TransactionInstruction {
    return this.instructionService.createInitMintInstructionForUsersPublicKey(
      tokenMintAddress,
      mintAuthorityAddress,
      freezeAuthorityAddress,
      decimals,
    );
  }

  async createMintAccountInstruction(
    tokenMintAddress: PublicKey,
    walletPubKey: PublicKey,
  ): Promise<TransactionInstruction> {
    return this.instructionService.createMintAccountInstruction(tokenMintAddress, walletPubKey);
  }

  createMintToInstruction(
    tokenMintAddress: PublicKey,
    tokenAccountAddress: PublicKey,
    walletPubKey: PublicKey,
    multiSigners: Array<Signer> = [],
    amountToMint = 1,
  ): TransactionInstruction {
    return this.instructionService.createMintToInstruction(
      tokenMintAddress,
      tokenAccountAddress,
      walletPubKey,
      multiSigners,
      amountToMint,
    );
  }

  createAssociatedTokenAccountInstruction(
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey,
  ): TransactionInstruction {
    return this.instructionService.createAssociatedTokenAccountInstruction(
      associatedTokenAddress,
      payer,
      walletAddress,
      splTokenMintAddress,
    );
  }

  createApproveInstruction(
    tokenAccountAdr: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Keypair>,
    amount: number | u64,
  ): TransactionInstruction {
    return this.instructionService.createApproveInstruction(
      tokenAccountAdr,
      delegate,
      owner,
      multiSigners,
      amount,
    );
  }

  createRevokeInstruction(
    tokenAccountAdr: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Keypair>,
  ): TransactionInstruction {
    return this.instructionService.createRevokeInstruction(tokenAccountAdr, owner, multiSigners);
  }

  async getErrorForTransaction(txID: string): Promise<Array<string>> {
    return this.transactionService.getErrorForTransaction(txID);
  }

  async sendTransactionsWithManualRetry(
    instructions: Array<Array<TransactionInstruction>>,
    signers: Array<Array<Keypair>>,
  ): Promise<string[]> {
    return this.transactionService.sendTransactionsWithManualRetry(instructions, signers);
  }

  async sendTransactions(
    instructionSet: Array<Array<TransactionInstruction>>,
    signersSet: Array<Array<Keypair>>,
    sequenceType = 'Parallel',
    commitment: Commitment = 'singleGossip',
    successCallback = (_txid: string, _ind: any) => {},
    failCallback = (_txid: string, _ind: any) => false,
    block?: {
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    },
  ): Promise<{ number: number; txs: Awaited<{ txid: string; slot: number }>[] }> {
    return this.transactionService.sendTransactions(
      instructionSet,
      signersSet,
      sequenceType,
      commitment,
      successCallback,
      failCallback,
      block,
    );
  }

  async sendSignedTransaction(
    signedTransaction: Transaction,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<{ txid: string; slot: number }> {
    return this.transactionService.sendSignedTransaction(signedTransaction, timeout);
  }

  async sendTransaction(
    instructions: Array<TransactionInstruction>,
    signers: Array<Keypair>,
    awaitConfirmation = true,
    commitment: Commitment = 'singleGossip',
    includesFeePayer = false,
    successCallback = (_txid: string, _ind: any) => {},
    failCallback = (_txid: string, _ind: any) => false,
    block?: {
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    },
  ): Promise<{ txid: string; slot: number }> {
    return this.transactionService.sendTransaction(
      instructions,
      signers,
      awaitConfirmation,
      commitment,
      includesFeePayer,
      successCallback,
      failCallback,
      block,
    );
  }

  async sendTransactionWithRetry(
    instructions: Array<TransactionInstruction>,
    signers: Array<Keypair>,
    commitment: Commitment = 'singleGossip',
    includesFeePayer = false,
    beforeSend?: () => void | null,
    block?: BlockType | null,
  ): Promise<{ txid: string; slot: number }> {
    return this.transactionService.sendTransactionWithRetry(
      instructions,
      signers,
      commitment,
      includesFeePayer,
      beforeSend,
      block,
    );
  }

  async simulateTransaction(transaction: Transaction, commitment: Commitment): Promise<any> {
    return this.transactionService.simulateTransaction(transaction, commitment);
  }

  async awaitTransactionSignatureConfirmation(
    txID: string,
    timeout: number,
    commitment = 'recent',
    queryStatus = false,
  ): Promise<SignatureStatus | null> {
    return this.transactionService.awaitTransactionSignatureConfirmation(
      txID,
      timeout,
      commitment,
      queryStatus,
    );
  }
}
