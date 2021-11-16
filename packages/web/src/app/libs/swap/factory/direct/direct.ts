import type { Program } from '@project-serum/anchor';
import type { SendTxRequest } from '@project-serum/anchor/dist/cjs/provider';
import type { Market } from '@project-serum/serum';
import { OpenOrders } from '@project-serum/serum';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey, Signer } from '@solana/web3.js';
import { Keypair, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

import { DEX_PID } from '../../constants';
import type { ExchangeRate, SideEnum } from '../../types';
import { unwrapSol } from '../../utils/unwrapSol';
import { wrapSol } from '../../utils/wrapSol';
import type { ParamsWSOL } from '../abstract';
import { SwapAbstract } from '../abstract';
import { getAssociatedTokenAddress } from '../utils/getAssociatedTokenAddress';
import { getVaultOwnerAndNonce } from '../utils/getVaultOwnerAndNonce';

export type SwapDirectParams = {
  coinWallet: PublicKey | undefined;
  baseMint: PublicKey;
  pcWallet: PublicKey | undefined;
  quoteMint: PublicKey;
  side: SideEnum;
  amount: BN;
  minExchangeRate: ExchangeRate;
  fromMarket: Market;
  fromOpenOrders?: PublicKey;
  referral?: PublicKey;
};

export class SwapDirect extends SwapAbstract {
  private readonly _fromMarket: Market;
  private readonly _fromOpenOrders: PublicKey | undefined;
  private readonly _coinWallet: PublicKey | undefined;
  private readonly _baseMint: PublicKey;
  private readonly _pcWallet: PublicKey | undefined;
  private readonly _quoteMint: PublicKey;
  private readonly _side: SideEnum;
  private readonly _amount: BN;
  private readonly _minExchangeRate: ExchangeRate;
  private readonly _referral: PublicKey | undefined;

  constructor(
    program: Program,
    paramsWSOL: ParamsWSOL,
    {
      fromMarket,
      fromOpenOrders,
      coinWallet,
      baseMint,
      pcWallet,
      quoteMint,
      side,
      amount,
      minExchangeRate,
      referral,
    }: SwapDirectParams,
  ) {
    super(program, paramsWSOL);

    this._fromMarket = fromMarket;
    this._fromOpenOrders = fromOpenOrders;
    this._coinWallet = coinWallet;
    this._baseMint = baseMint;
    this._pcWallet = pcWallet;
    this._quoteMint = quoteMint;
    this._side = side;
    this._amount = amount;
    this._minExchangeRate = minExchangeRate;
    this._referral = referral;
  }

  estimate(): BN {
    const estimatedFee = new BN(0);

    if (!this._fromOpenOrders) {
      estimatedFee.addn(OpenOrders.getLayout(DEX_PID).span);
    }

    return new BN(0);
  }

  async swapTxs(): Promise<SendTxRequest[]> {
    const openOrdersTransaction = new Transaction();
    const openOrdersSigners: Signer[] = [];
    const swapTransaction = new Transaction();
    const swapSigners: Signer[] = [];

    const [vaultSigner] = await getVaultOwnerAndNonce(this._fromMarket.address);

    let fromOpenOrders = this._fromOpenOrders;

    // Create the open orders account, if needed.
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

    let coinWallet = this._coinWallet;

    // If either wallet isn't given, then create the associated token account.
    if (!coinWallet) {
      coinWallet = await getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        this._baseMint,
        this._program.provider.wallet.publicKey,
      );

      swapTransaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this._baseMint,
          coinWallet,
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
        this._quoteMint,
        this._program.provider.wallet.publicKey,
      );
      swapTransaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this._quoteMint,
          pcWallet,
          this._program.provider.wallet.publicKey,
          this._program.provider.wallet.publicKey,
        ),
      );
    }

    swapTransaction.add(
      this._program.instruction.swap(this._side, this._amount, this._minExchangeRate, {
        accounts: {
          market: {
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
            vaultSigner,
            openOrders: fromOpenOrders,
            orderPayerTokenAccount: this._side.bid ? pcWallet : coinWallet,
            coinWallet,
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

    txs.push({ tx: swapTransaction, signers: swapSigners });

    return txs;
  }
}
