import { ZERO } from '@orca-so/sdk';
import { SPLToken } from '@saberhq/token-utils';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { zip } from 'ramda';
import { injectable } from 'tsyringe';

import {
  FeeRelayerAPIClient,
  FeeRelayerConfiguration,
  FeeRelayerContextManager,
  FeeRelayerRelaySolanaClient,
  StatsInfoOperationType,
  TokenAccount,
} from 'new/sdk/FeeRelayer';
import {
  AccountInfo,
  FeeAmount,
  getAssociatedTokenAddressSync,
  SolanaSDKPublicKey,
  Token,
  Wallet,
} from 'new/sdk/SolanaSDK';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { RelayService } from 'new/services/RelayService';
import { WalletsRepository } from 'new/services/Repositories';

@injectable()
export class RenBTCStatusService {
  private _feeRelayerContextManager: FeeRelayerContextManager;

  private _minRentExemption?: u64;
  private _lamportsPerSignature?: u64;
  private _rentExemptMinimum?: u64;

  constructor(
    private _feeRelayerAPIClient: FeeRelayerRelaySolanaClient,
    private _orcaSwap: OrcaSwapService,
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
    await this._orcaSwap.load();

    this._minRentExemption = await this._feeRelayerAPIClient.getMinimumBalanceForRentExemption(
      AccountInfo.span,
    );
    this._lamportsPerSignature = await this._feeRelayerAPIClient.getLamportsPerSignature();
    this._rentExemptMinimum = await this._feeRelayerAPIClient.getMinimumBalanceForRentExemption(0);
  }

  async getPayableWallets(): Promise<Wallet[]> {
    const wallets = this._walletsRepository
      .getWallets()
      .filter((wallet) => wallet.lamports?.gt(ZERO));

    // At lease one wallet is payable
    const group = await Promise.all(
      wallets.map((w): Promise<u64 | null> => this.getCreationFee(w.mintAddress).catch(() => null)),
    );

    const walletsNew: Wallet[] = [];
    for (const [w, fee] of zip(wallets, group)) {
      if (fee && fee.lte(w.lamports ?? ZERO)) {
        // Special case where wallet is native sol,
        // needs to keeps rentExemptMinimum lamports in account to prevent error
        // Transaction leaves an account with a lower balance than rent-exempt minimum
        if (w.isNativeSOL && (w.lamports ?? ZERO).sub(fee).lt(this._rentExemptMinimum ?? ZERO)) {
          continue;
        } else {
          walletsNew.push(w);
        }
      }
    }
    return walletsNew;
  }

  async createAccount(_address: string, _mint: string): Promise<void> {
    const address = new PublicKey(_address);
    const mint = new PublicKey(_mint);
    const owner = this._feeRelayerAPIClient.provider.wallet.publicKey;

    const associatedAccount = getAssociatedTokenAddressSync(SolanaSDKPublicKey.renBTCMint, owner);

    // prepare transaction
    const feePayer = (await this._feeRelayerContextManager.getCurrentContext()).feePayerAddress;
    const preparing = this._feeRelayerAPIClient.prepareTransaction({
      instructions: [
        SPLToken.createAssociatedTokenAccountInstruction(
          SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
          SolanaSDKPublicKey.tokenProgramId,
          SolanaSDKPublicKey.renBTCMint,
          associatedAccount,
          owner,
          feePayer,
        ),
      ],
      feePayer,
    });

    const updating = this._feeRelayerContextManager.update();

    const [preparedTransaction] = await Promise.all([preparing, updating]);

    // hack
    preparedTransaction.owner = owner;

    const context = await this._feeRelayerContextManager.getCurrentContext();
    const tx = await this._feeRelayer.topUpAndRelayTransaction({
      context,
      transaction: preparedTransaction,
      fee: new TokenAccount({ address: address, mint: mint }),
      config: new FeeRelayerConfiguration({
        operationType: StatsInfoOperationType.transfer,
        currency: mint.toBase58(),
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

      if (!wallets.some((wallet) => wallet.pubkey === SolanaSDKPublicKey.renBTCMint.toString())) {
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

  async getCreationFee(_mintAddress: string): Promise<u64> {
    const mintAddress = new PublicKey(_mintAddress);

    const feeAmount = new FeeAmount({
      transaction: this._lamportsPerSignature ?? new u64(5000),
      accountBalances: this._minRentExemption ?? new u64(2_039_280),
    });

    const feeInSOL = this._feeRelayer.feeCalculator.calculateNeededTopUpAmount({
      context: await this._feeRelayerContextManager.getCurrentContext(),
      expectedFee: feeAmount,
      payingTokenMint: mintAddress,
    });

    const feeInToken = await this._feeRelayer.feeCalculator.calculateFeeInPayingToken({
      orcaSwap: this._orcaSwap,
      feeInSOL: feeInSOL,
      payingFeeTokenMint: mintAddress,
    });

    return feeInToken.total;
  }
}
