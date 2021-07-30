import React, { FC, useState } from 'react';

import { Provider } from '@project-serum/anchor';
import {
  FEE_MULTIPLIER,
  SOL_MINT,
  useCanSwap,
  useDexContext,
  useMarket,
  useMint,
  useOpenOrders,
  useOwnedTokenAccount,
  useReferral,
  useRouteVerbose,
  useSwapContext,
  useSwapFair,
  useTokenMap,
  WRAPPED_SOL_MINT,
} from '@project-serum/swap-ui';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

import { Button } from 'components/ui';
import { swapNotification } from 'utils/transactionNotifications';

async function wrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair,
  fromMint: PublicKey,
  amount: BN,
): Promise<{ tx: Transaction; signers: Array<Signer | undefined> }> {
  const tx = new Transaction();
  const signers = [wrappedSolAccount];
  // Create new, rent exempt account.
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: wrappedSolAccount.publicKey,
      lamports: await Token.getMinBalanceRentForExemptAccount(provider.connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  // Transfer lamports. These will be converted to an SPL balance by the
  // token program.
  if (fromMint.equals(SOL_MINT)) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: wrappedSolAccount.publicKey,
        lamports: amount.toNumber(),
      }),
    );
  }
  // Initialize the account.
  tx.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WRAPPED_SOL_MINT,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey,
    ),
  );
  return { tx, signers };
}

function unwrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair,
): { tx: Transaction; signers: Array<Signer | undefined> } {
  const tx = new Transaction();
  tx.add(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      [],
    ),
  );
  return { tx, signers: [] };
}

export const SwapButton: FC = () => {
  const {
    fromMint,
    toMint,
    fromAmount,
    slippage,
    isClosingNewAccounts,
    isStrict,
  } = useSwapContext();
  const { swapClient } = useDexContext();
  const fromMintInfo = useMint(fromMint);
  const toMintInfo = useMint(toMint);
  const openOrders = useOpenOrders();
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);
  const toMarket = useMarket(route && route.markets ? route.markets[1] : undefined);
  const canSwap = useCanSwap();
  const referral = useReferral(fromMarket);
  const fair = useSwapFair();
  const fromWallet = useOwnedTokenAccount(fromMint);
  const toWallet = useOwnedTokenAccount(toMint);
  const quoteMint = fromMarket && fromMarket.quoteMintAddress;
  const quoteMintInfo = useMint(quoteMint);
  const quoteWallet = useOwnedTokenAccount(quoteMint);

  const tokenMap = useTokenMap();
  const fromTokenInfo = tokenMap.get(fromMint.toString());
  const toTokenInfo = tokenMap.get(toMint.toString());

  const [isExecuting, setIsExecuting] = useState(false);

  // Click handler.
  const sendSwapTransaction = async () => {
    setIsExecuting(true);

    const notificationParams = {
      text: `${fromTokenInfo?.symbol} to ${toTokenInfo?.symbol}`,
      symbol: fromTokenInfo?.symbol,
      symbolB: toTokenInfo?.symbol,
    };

    try {
      if (!fromMintInfo || !toMintInfo) {
        throw new Error('Unable to calculate mint decimals');
      }
      if (!fair) {
        throw new Error('Invalid fair');
      }
      if (!quoteMint || !quoteMintInfo) {
        throw new Error('Quote mint not found');
      }

      swapNotification({
        header: 'Swap processing...',
        status: 'processing',
        ...notificationParams,
      });

      const amount = new BN(fromAmount * 10 ** fromMintInfo.decimals);
      const isSol = fromMint.equals(SOL_MINT) || toMint.equals(SOL_MINT);
      const wrappedSolAccount = isSol ? Keypair.generate() : undefined;

      // Build the swap.
      const txs = await (async () => {
        if (!fromMarket) {
          throw new Error('Market undefined');
        }

        const minExchangeRate = {
          rate: new BN((10 ** toMintInfo.decimals * FEE_MULTIPLIER) / fair)
            .muln(100 - slippage)
            .divn(100),
          fromDecimals: fromMintInfo.decimals,
          quoteDecimals: quoteMintInfo.decimals,
          strict: isStrict,
        };
        const fromOpenOrders = fromMarket
          ? openOrders.get(fromMarket?.address.toString())
          : undefined;
        const toOpenOrders = toMarket ? openOrders.get(toMarket?.address.toString()) : undefined;
        const fromWalletAddr = fromMint.equals(SOL_MINT)
          ? wrappedSolAccount?.publicKey
          : (fromWallet
          ? fromWallet.publicKey
          : undefined);
        const toWalletAddr = toMint.equals(SOL_MINT)
          ? wrappedSolAccount?.publicKey
          : (toWallet
          ? toWallet.publicKey
          : undefined);

        return swapClient.swapTxs({
          fromMint,
          toMint,
          quoteMint,
          amount,
          minExchangeRate,
          referral,
          fromMarket,
          toMarket,
          // Automatically created if undefined.
          fromOpenOrders: fromOpenOrders ? fromOpenOrders[0].address : undefined,
          toOpenOrders: toOpenOrders ? toOpenOrders[0].address : undefined,
          fromWallet: fromWalletAddr,
          toWallet: toWalletAddr,
          quoteWallet: quoteWallet ? quoteWallet.publicKey : undefined,
          // Auto close newly created open orders accounts.
          close: isClosingNewAccounts,
        });
      })();

      // If swapping SOL, then insert a wrap/unwrap instruction.
      if (isSol) {
        if (txs.length > 1) {
          throw new Error('SOL must be swapped in a single transaction');
        }
        const { tx: wrapTx, signers: wrapSigners } = await wrapSol(
          swapClient.program.provider,
          wrappedSolAccount as Keypair,
          fromMint,
          amount,
        );
        const { tx: unwrapTx, signers: unwrapSigners } = unwrapSol(
          swapClient.program.provider,
          wrappedSolAccount as Keypair,
        );
        const tx = new Transaction();
        tx.add(wrapTx);
        tx.add(txs[0].tx);
        tx.add(unwrapTx);
        txs[0].tx = tx;
        txs[0].signers.push(...wrapSigners);
        txs[0].signers.push(...unwrapSigners);
      }

      await swapClient.program.provider.sendAll(txs);

      swapNotification({
        header: 'Swapped successfuly!',
        status: 'success',
        ...notificationParams,
      });
    } catch (error) {
      console.error('Something wrong with swap:', error);

      swapNotification({
        header: 'Swap didn’t complete!',
        status: 'error',
        ...notificationParams,
        text: (error as Error).message,
      });

      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const renderActionText = () => {
    if (isExecuting) {
      return 'Processing...';
    }

    if (route) {
      return 'Swap now';
    }

    if (!fromMint || !toMint) {
      return 'Choose tokens for swap';
    }

    return 'This pair is unavailable';
  };

  const isDisabled = !canSwap;

  return (
    <Button primary disabled={isDisabled} big full onClick={sendSwapTransaction}>
      {renderActionText()}
    </Button>
  );
};
