import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import type { FeeRelayerContext } from 'new/sdk/FeeRelayer';
import * as FeeRelayer from 'new/sdk/FeeRelayer';
import { FeeRelayerConfiguration, StatsInfoOperationType } from 'new/sdk/FeeRelayer';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance, SolanaSDKError, SolanaSDKPublicKey, toLamport } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { SendServiceError } from 'new/services/SendService/SendServiceError';
import type { SolanaService } from 'new/services/SolanaService';

export class SendServiceRelayMethod {
  private _solanaAPIClient: SolanaService;
  private _feeRelayer: FeeRelayer.FeeRelayer;

  constructor({
    solanaAPIClient,
    feeRelayer,
  }: {
    solanaAPIClient: SolanaService;
    feeRelayer: FeeRelayer.FeeRelayer;
  }) {
    this._solanaAPIClient = solanaAPIClient;
    this._feeRelayer = feeRelayer;
  }

  async getFeeViaRelayMethod({
    context,
    wallet,
    receiver,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    wallet: Wallet;
    receiver: string;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount | null> {
    let transactionFee: u64 = ZERO;

    // owner's signature
    transactionFee = new u64(transactionFee.add(context.lamportsPerSignature));

    // feePayer's signature
    transactionFee = new u64(transactionFee.add(context.lamportsPerSignature));

    let isAssociatedTokenUnregister: boolean;
    if (wallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      isAssociatedTokenUnregister = false;
    } else {
      const destinationInfo = await this._solanaAPIClient.findSPLTokenDestinationAddress({
        mintAddress: wallet.mintAddress,
        destinationAddress: receiver,
      });
      isAssociatedTokenUnregister = destinationInfo.isUnregisteredAsocciatedToken;
    }

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        context,
        payingTokenMint,
      })
    ) {
      // subtract the fee payer signature cost
      transactionFee = new u64(transactionFee.sub(context.lamportsPerSignature));
    }

    const expectedFee = new SolanaSDK.FeeAmount({
      transaction: transactionFee,
      accountBalances: isAssociatedTokenUnregister ? context.minimumTokenAccountBalance : ZERO,
    });

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        context,
        payingTokenMint,
      })
    ) {
      return expectedFee;
    }

    return this._feeRelayer.feeCalculator.calculateNeededTopUpAmount({
      context,
      expectedFee,
      payingTokenMint: payingTokenMint ? new PublicKey(payingTokenMint) : undefined,
    });
  }

  async sendToSolanaBCViaRelayMethod({
    context,
    wallet,
    receiver,
    amount,
    payingFeeWallet,
  }: {
    context: FeeRelayerContext;
    wallet: Wallet;
    receiver: string;
    amount: SolanaSDK.Lamports;
    payingFeeWallet?: Wallet | null;
  }): Promise<string> {
    // get paying fee token
    const payingFeeTokenNew = this._getPayingFeeToken({
      payingFeeWallet,
    });

    const currency = wallet.mintAddress;

    const { preparedTransaction, useFeeRelayer } =
      await this._prepareForSendingToSolanaNetworkViaRelayMethod({
        context,
        wallet,
        receiver,
        amount: convertToBalance(amount, wallet.token.decimals),
        payingFeeToken: payingFeeTokenNew,
      });
    // TODo: check
    // preparedTransaction.transaction.recentBlockhash = await this._solanaAPIClient.getRecentBlockhash();

    if (useFeeRelayer) {
      // using fee relayer
      return this._feeRelayer.topUpAndRelayTransaction({
        context,
        transaction: preparedTransaction,
        fee: payingFeeTokenNew,
        config: new FeeRelayerConfiguration({
          operationType: StatsInfoOperationType.transfer,
          currency,
        }),
      });
    } else {
      // send normally, paid by SOL
      return this._solanaAPIClient.sendTransaction({
        preparedTransaction,
      });
    }
  }

  private async _prepareForSendingToSolanaNetworkViaRelayMethod({
    context,
    wallet,
    receiver,
    amount,
    payingFeeToken,
    minRentExemption,
  }: {
    context: FeeRelayerContext;
    wallet: Wallet;
    receiver: string;
    amount: number;
    payingFeeToken?: FeeRelayer.TokenAccount | null;
    recentBlockhash?: string;
    lamportsPerSignature?: SolanaSDK.Lamports;
    minRentExemption?: SolanaSDK.Lamports;
  }): Promise<{
    preparedTransaction: SolanaSDK.PreparedTransaction;
    useFeeRelayer: boolean;
  }> {
    const amountNew = toLamport(amount, wallet.token.decimals);
    const sender = wallet.pubkey;
    if (!sender) {
      throw SolanaSDKError.other('Source wallet is not valid');
    }
    // form request
    if (receiver === sender) {
      throw SolanaSDKError.other('You can not send tokens to yourself');
    }

    // prepare fee payer
    let feePayer: PublicKey | null;
    let useFeeRelayer: boolean;

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
        context,
        payingTokenMint: payingFeeToken?.mint.toString(),
      })
    ) {
      feePayer = null;
      useFeeRelayer = false;
    }
    // otherwise send to fee relayer
    else {
      feePayer = context.feePayerAddress;
      useFeeRelayer = true;
    }

    let preparedTransaction: SolanaSDK.PreparedTransaction;
    if (wallet.isNativeSOL) {
      preparedTransaction = await this._solanaAPIClient.prepareSendingNativeSOL({
        account: this._solanaAPIClient.provider.wallet.publicKey,
        destination: receiver,
        amount: amountNew,
        feePayer,
      });
    }
    // other tokens
    else {
      preparedTransaction = (
        await this._solanaAPIClient.prepareSendingSPLTokens({
          account: this._solanaAPIClient.provider.wallet.publicKey,
          mintAddress: wallet.mintAddress,
          decimals: wallet.token.decimals,
          fromPublicKey: sender,
          destinationAddress: receiver,
          amount: amountNew,
          feePayer,
          transferChecked: useFeeRelayer, // create transferChecked instruction when using fee relayer
          minRentExemption,
        })
      ).preparedTransaction;
    }

    // TODO: check
    // preparedTransaction.transaction.recentBlockhash = recentBlockhash;
    return {
      preparedTransaction,
      useFeeRelayer,
    };
  }

  private _getPayingFeeToken({
    payingFeeWallet,
  }: {
    payingFeeWallet?: Wallet | null;
  }): FeeRelayer.TokenAccount | null {
    if (!payingFeeWallet) {
      return null;
    }

    const addressString = payingFeeWallet.pubkey;
    if (!addressString) {
      throw SendServiceError.invalidPayingFeeWallet();
    }

    const address = new PublicKey(addressString);
    const mintAddress = new PublicKey(payingFeeWallet.mintAddress);

    return new FeeRelayer.TokenAccount({
      address,
      mint: mintAddress,
    });
  }

  private _isFreeTransactionNotAvailableAndUserIsPayingWithSOL({
    context,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    payingTokenMint?: string;
  }): boolean {
    const expectedTransactionFee = new u64(context.lamportsPerSignature.muln(2));
    return (
      payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
      !context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: expectedTransactionFee,
      })
    );
  }
}
