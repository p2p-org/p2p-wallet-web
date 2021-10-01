import { Program } from '@project-serum/anchor';
import { SendTxRequest } from '@project-serum/anchor/dist/cjs/provider';
import { Market, OpenOrders } from '@project-serum/serum';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, Signer, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

import { unwrapSol } from 'app/libs/swap/utils/unwrapSol';
import { wrapSol } from 'app/libs/swap/utils/wrapSol';

import { DEX_PID } from '../../constants';
import { ExchangeRate } from '../../types';
import { ParamsWSOL, SwapAbstract } from '../abstract';
import { getAssociatedTokenAddress } from '../utils/getAssociatedTokenAddress';
import { getVaultOwnerAndNonce } from '../utils/getVaultOwnerAndNonce';

export type SwapTransitiveParams = {
  fromWallet: PublicKey;
  fromMint: PublicKey;
  toWallet: PublicKey | undefined;
  toMint: PublicKey;
  pcWallet: PublicKey | undefined;
  pcMint: PublicKey;
  amount: BN;
  minExchangeRate: ExchangeRate;
  fromMarket: Market;
  toMarket: Market;
  fromOpenOrders?: PublicKey;
  toOpenOrders?: PublicKey;
  referral?: PublicKey;
};

export class SwapTransitive extends SwapAbstract {
  private readonly _fromMarket: Market;
  private readonly _fromOpenOrders: PublicKey | undefined;
  private readonly _toOpenOrders: PublicKey | undefined;
  private readonly _toMarket: Market;
  private readonly _fromWallet: PublicKey;
  private readonly _fromMint: PublicKey;
  private readonly _toWallet: PublicKey | undefined;
  private readonly _toMint: PublicKey;
  private readonly _pcWallet: PublicKey | undefined;
  private readonly _pcMint: PublicKey;
  private readonly _amount: BN;
  private readonly _minExchangeRate: ExchangeRate;
  private readonly _referral: PublicKey | undefined;

  constructor(
    program: Program,
    paramsWSOL: ParamsWSOL,
    {
      fromMint,
      toMint,
      pcMint,
      fromWallet,
      toWallet,
      pcWallet,
      amount,
      minExchangeRate,
      referral,
      fromMarket,
      toMarket,
      fromOpenOrders,
      toOpenOrders,
    }: SwapTransitiveParams,
  ) {
    super(program, paramsWSOL);

    this._fromMarket = fromMarket;
    this._fromOpenOrders = fromOpenOrders;
    this._toOpenOrders = toOpenOrders;
    this._toMarket = toMarket;
    this._fromWallet = fromWallet;
    this._fromMint = fromMint;
    this._toWallet = toWallet;
    this._toMint = toMint;
    this._pcWallet = pcWallet;
    this._pcMint = pcMint;
    this._amount = amount;
    this._minExchangeRate = minExchangeRate;
    this._referral = referral;
  }

  estimate(): BN {
    return new BN(0);
  }

  async swapTxs(): Promise<SendTxRequest[]> {
    const openOrdersTransaction: Transaction = new Transaction();
    const openOrdersSigners: Signer[] = [];
    const walletsTransaction: Transaction = new Transaction();
    const walletsSigners: Signer[] = [];
    const swapTransaction: Transaction = new Transaction();
    const swapSigners: Signer[] = [];

    // Calculate the vault signers for each market.
    const [fromVaultSigner] = await getVaultOwnerAndNonce(this._fromMarket.address);
    const [toVaultSigner] = await getVaultOwnerAndNonce(this._toMarket.address);

    // Add instructions to create open orders, if needed.
    //
    // If creating open orders accounts on *both* from and to markets, then
    // split out the create open orders instructions into their own transaction.
    let fromOpenOrders = this._fromOpenOrders;

    if (!fromOpenOrders) {
      const openOrderKeypair = Keypair.generate();
      fromOpenOrders = openOrderKeypair.publicKey;
      openOrdersTransaction.add(
        await OpenOrders.makeCreateAccountTransaction(
          this._program.provider.connection,
          this._fromMarket.address,
          this._program.provider.wallet.publicKey,
          fromOpenOrders,
          DEX_PID,
        ),
      );
      openOrdersSigners.push(openOrderKeypair);

      openOrdersTransaction.add(
        this._program.instruction.initAccount({
          accounts: {
            openOrders: fromOpenOrders,
            authority: this._program.provider.wallet.publicKey,
            market: this._fromMarket.address,
            dexProgram: DEX_PID,
            rent: SYSVAR_RENT_PUBKEY,
          },
        }),
      );
    }

    let toOpenOrders = this._toOpenOrders;

    if (!toOpenOrders) {
      const openOrderKeypair = Keypair.generate();
      toOpenOrders = openOrderKeypair.publicKey;
      openOrdersTransaction.add(
        await OpenOrders.makeCreateAccountTransaction(
          this._program.provider.connection,
          this._toMarket.address,
          this._program.provider.wallet.publicKey,
          toOpenOrders,
          DEX_PID,
        ),
      );
      openOrdersSigners.push(openOrderKeypair);

      openOrdersTransaction.add(
        this._program.instruction.initAccount({
          accounts: {
            openOrders: toOpenOrders,
            authority: this._program.provider.wallet.publicKey,
            market: this._toMarket.address,
            dexProgram: DEX_PID,
            rent: SYSVAR_RENT_PUBKEY,
          },
        }),
      );
    }

    let fromWallet = this._fromWallet;

    // If token accounts aren't given, create them.
    if (!fromWallet) {
      fromWallet = await getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        this._fromMint,
        this._program.provider.wallet.publicKey,
      );
      walletsTransaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this._fromMint,
          fromWallet,
          this._program.provider.wallet.publicKey,
          this._program.provider.wallet.publicKey,
        ),
      );
    }

    let toWallet = this._toWallet;

    if (!toWallet) {
      toWallet = await getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        this._toMint,
        this._program.provider.wallet.publicKey,
      );
      walletsTransaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this._toMint,
          toWallet,
          this._program.provider.wallet.publicKey,
          this._program.provider.wallet.publicKey,
        ),
      );
    }

    let pcWallet = this._pcWallet;

    if (!pcWallet) {
      pcWallet = await getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        this._pcMint,
        this._program.provider.wallet.publicKey,
      );
      walletsTransaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this._pcMint,
          pcWallet,
          this._program.provider.wallet.publicKey,
          this._program.provider.wallet.publicKey,
        ),
      );
    }

    if (this._paramsWSOL.isSol) {
      const { tx: wrapTx, signers: wrapSigners } = await wrapSol(
        this._program.provider,
        this._paramsWSOL.wrappedSolAccount as Keypair,
        this._paramsWSOL.fromMint,
        this._amount,
      );

      swapTransaction.add(wrapTx);
      swapSigners.push(...wrapSigners);
    }

    swapTransaction.add(
      this._program.instruction.swapTransitive(this._amount, this._minExchangeRate, {
        accounts: {
          from: {
            market: this._fromMarket.address,
            // @ts-ignore
            requestQueue: this._fromMarket._decoded.requestQueue,
            // @ts-ignore
            eventQueue: this._fromMarket._decoded.eventQueue,
            bids: this._fromMarket.bidsAddress,
            asks: this._fromMarket.asksAddress,
            // @ts-ignore
            coinVault: this._fromMarket._decoded.baseVault,
            // @ts-ignore
            pcVault: this._fromMarket._decoded.quoteVault,
            vaultSigner: fromVaultSigner,
            openOrders: fromOpenOrders,
            orderPayerTokenAccount: fromWallet,
            coinWallet: fromWallet,
          },
          to: {
            market: this._toMarket.address,
            // @ts-ignore
            requestQueue: this._toMarket._decoded.requestQueue,
            // @ts-ignore
            eventQueue: this._toMarket._decoded.eventQueue,
            bids: this._toMarket.bidsAddress,
            asks: this._toMarket.asksAddress,
            // @ts-ignore
            coinVault: this._toMarket._decoded.baseVault,
            // @ts-ignore
            pcVault: this._toMarket._decoded.quoteVault,
            vaultSigner: toVaultSigner,
            openOrders: toOpenOrders,
            orderPayerTokenAccount: pcWallet,
            coinWallet: toWallet,
          },
          pcWallet,
          authority: this._program.provider.wallet.publicKey,
          dexProgram: DEX_PID,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: TOKEN_PROGRAM_ID,
        },
        remainingAccounts: this._referral && [
          { pubkey: this._referral, isWritable: true, isSigner: false },
        ],
      }),
    );

    if (this._paramsWSOL.isSol) {
      const { tx: unwrapTx, signers: unwrapSigners } = unwrapSol(
        this._program.provider,
        this._paramsWSOL.wrappedSolAccount as Keypair,
      );

      swapTransaction.add(unwrapTx);
      swapSigners.push(...unwrapSigners);
    }

    const txs: Array<SendTxRequest> = [];

    if (openOrdersTransaction?.instructions.length) {
      txs.push({ tx: openOrdersTransaction, signers: openOrdersSigners });
    }

    if (walletsTransaction?.instructions.length) {
      txs.push({ tx: walletsTransaction, signers: walletsSigners });
    }

    txs.push({ tx: swapTransaction, signers: swapSigners });

    return txs;
  }
}
