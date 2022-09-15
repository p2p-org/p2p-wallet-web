import { ZERO } from '@orca-so/sdk';
import { SPLToken } from '@saberhq/token-utils';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { zip } from 'ramda';
import { injectable } from 'tsyringe';

import { RelayService } from 'new/services/RelayService';

import {
  FeeRelayerAPIClient,
  FeeRelayerConfiguration,
  FeeRelayerContextManager,
  FeeRelayerRelaySolanaClient,
  StatsInfoOperationType,
  TokenAccount,
} from '../../../../sdk/FeeRelayer';
import {
  AccountInfo,
  FeeAmount,
  getAssociatedTokenAddressSync,
  SolanaSDKPublicKey,
  Token,
  Wallet,
} from '../../../../sdk/SolanaSDK';
import { OrcaSwapService } from '../../../../services/OrcaSwapService';
import { WalletsRepository } from '../../../../services/Repositories';

@injectable()
export class RenBTCStatusService {
  private _minRentExemption?: u64;
  private _lamportsPerSignature?: u64;
  private _rentExemptMinimum?: u64;
  private _feeRelayerContextManager: FeeRelayerContextManager;

  constructor(
    private _orcaSwap: OrcaSwapService,
    private _feeRelayerAPIClient: FeeRelayerRelaySolanaClient,
    private _walletsRepository: WalletsRepository,
    private _feeRelayer: RelayService,
  ) {
    const feeRelayerAPIClient = new FeeRelayerAPIClient();
    this._feeRelayerContextManager = new FeeRelayerContextManager({
      owner: this._feeRelayerAPIClient.provider.wallet.publicKey,
      solanaAPIClient: this._feeRelayerAPIClient,
      feeRelayerAPIClient,
    });
  }

  async load() {
    try {
      await this._orcaSwap.load();

      this._minRentExemption = await this._feeRelayerAPIClient.getMinimumBalanceForRentExemption(
        AccountInfo.span,
      );

      this._lamportsPerSignature = await this._feeRelayerAPIClient.getLamportsPerSignature();

      this._rentExemptMinimum = await this._feeRelayerAPIClient.getMinimumBalanceForRentExemption(
        0,
      );
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  async getPayableWallets(): Promise<Wallet[]> {
    const wallets = this._walletsRepository
      .getWallets()
      .filter((wallet) => wallet.lamports?.gt(ZERO));

    // At lease one wallet is payable
    return Promise.all(
      wallets.map((wallet) => {
        return this.getCreationFee(wallet.mintAddress);
      }),
    )
      .then((fees) => zip(wallets, fees))
      .then((zipped) =>
        zipped
          .filter(([wallet, fee]) => {
            if (fee?.lte(wallet.lamports || ZERO)) {
              // Special case where wallet is native sol,
              // needs to keeps rentExemptMinimum lamports in account to prevent error
              // Transaction leaves an account with a lower balance than rent-exempt minimum
              if (
                wallet.isNativeSOL &&
                (wallet.lamports || ZERO).sub(fee).lt(this._rentExemptMinimum || ZERO)
              ) {
                return false;
              } else {
                return true;
              }
            } else {
              return false;
            }
          })
          .map(([wallet]) => wallet),
      );
  }

  async createAccount(address: string, mint: string): Promise<void> {
    const addressPubkey = new PublicKey(address);
    const mintPubkey = new PublicKey(mint);
    const ownerPubkey = this._feeRelayerAPIClient.provider.wallet.publicKey;

    const associatedAccount = getAssociatedTokenAddressSync(mintPubkey, ownerPubkey);

    // prepare transaction
    const feePayer = (await this._feeRelayerContextManager.getCurrentContext()).feePayerAddress;

    const instructions = SPLToken.createAssociatedTokenAccountInstruction(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
      SolanaSDKPublicKey.renBTCMint,
      associatedAccount,
      ownerPubkey,
      feePayer,
    );

    const preparedTransaction = await this._feeRelayerAPIClient.prepareTransaction({
      owner: this._feeRelayerAPIClient.provider.wallet.publicKey,
      instructions: [instructions],
      feePayer: feePayer,
    });

    await this._feeRelayerContextManager.update();

    const context = await this._feeRelayerContextManager.getCurrentContext();
    const tx = await this._feeRelayer.topUpAndRelayTransaction({
      context,
      transaction: preparedTransaction,
      fee: new TokenAccount({ address: addressPubkey, mint: mintPubkey }),
      config: new FeeRelayerConfiguration({
        operationType: StatsInfoOperationType.transfer,
        currency: mintPubkey.toBase58(),
      }),
    });

    await this._feeRelayerAPIClient.waitForConfirmation(tx);

    this._walletsRepository.batchUpdate((wallets) => {
      const string = wallets.find((wallet) => wallet.token.isNativeSOL)?.pubkey;
      if (!string) {
        return wallets;
      }
      const nativeWalletAddress = new PublicKey(string);
      const renBTCAddress = getAssociatedTokenAddressSync(
        SolanaSDKPublicKey.renBTCMint,
        nativeWalletAddress,
      );

      if (!wallets.some((wallet) => wallet.pubkey === SolanaSDKPublicKey.renBTCMint.toBase58())) {
        wallets.push(
          new Wallet({
            pubkey: renBTCAddress.toBase58(),
            lamports: ZERO,
            token: Token.renBTC,
          }),
        );
      }

      return wallets;
    });
  }

  async getCreationFee(mintAddress: string): Promise<u64> {
    const pubkey = new PublicKey(mintAddress);

    const feeAmount = new FeeAmount({
      transaction: this._lamportsPerSignature || new u64(5000),
      accountBalances: this._minRentExemption || new u64(2_039_280),
    });

    const context = await this._feeRelayerContextManager.getCurrentContext();

    const feeInSOL = this._feeRelayer.feeCalculator.calculateNeededTopUpAmount({
      context,
      expectedFee: feeAmount,
      payingTokenMint: pubkey,
    });

    const feeInToken = await this._feeRelayer.feeCalculator.calculateFeeInPayingToken({
      orcaSwap: this._orcaSwap,
      feeInSOL: feeInSOL,
      payingFeeTokenMint: pubkey,
    });

    if (feeInToken.total) {
      console.error('Could not calculating fees');
    }

    return feeInToken.total;
  }
}
