import { useCallback } from 'react';

import { Provider } from '@project-serum/anchor';
import {
  FEE_MULTIPLIER,
  SOL_MINT,
  useDexContext,
  useOpenOrders,
  useSwapContext,
  WRAPPED_SOL_MINT,
} from '@project-serum/swap-ui';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

import { useSwap } from './useSwap';

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

export const useSendSwap = () => {
  const { swapClient } = useDexContext();
  const openOrders = useOpenOrders();

  const { fromMint, toMint, fromAmount, slippage, isStrict } = useSwapContext();
  const {
    fromMintInfo,
    toMintInfo,
    fromWallet,
    toWallet,
    fromMarket,
    toMarket,
    route,
    quoteMint,
    quoteMintInfo,
    quoteWallet,
    fair,
    referral,
  } = useSwap({ fromMint, toMint });

  const swap = useCallback(async () => {
    if (!fromMintInfo || !toMintInfo) {
      throw new Error('Unable to calculate mint decimals');
    }
    if (!fair) {
      throw new Error('Invalid fair');
    }
    if (!quoteMint || !quoteMintInfo) {
      throw new Error('Quote mint not found');
    }

    const amount = new BN(fromAmount * 10 ** fromMintInfo.decimals);
    const isSol = fromMint.equals(SOL_MINT) || toMint.equals(SOL_MINT);
    const wrappedSolAccount = isSol ? Keypair.generate() : undefined;

    // Build the swap.
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

    const fromOpenOrders = fromMarket ? openOrders.get(fromMarket?.address.toString()) : undefined;
    const toOpenOrders = toMarket ? openOrders.get(toMarket?.address.toString()) : undefined;

    const fromWalletAddr = fromMint.equals(SOL_MINT)
      ? wrappedSolAccount?.publicKey
      : fromWallet
      ? fromWallet.publicKey
      : undefined;
    const toWalletAddr = toMint.equals(SOL_MINT)
      ? wrappedSolAccount?.publicKey
      : toWallet
      ? toWallet.publicKey
      : undefined;

    const txs = await swapClient.swapTxs({
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
    });

    // return;

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

    // const blockhash = await swapClient.program.provider.connection.getRecentBlockhash();
    //
    // let txss = txs.map((r) => {
    //   let tx = r.tx;
    //   let signers = r.signers;
    //
    //   if (signers === undefined) {
    //     signers = [];
    //   }
    //
    //   tx.feePayer = swapClient.program.provider.wallet.publicKey;
    //   tx.recentBlockhash = blockhash.blockhash;
    //
    //   signers
    //     .filter((s) => s !== undefined)
    //     .forEach((kp) => {
    //       tx.partialSign(kp);
    //     });
    //
    //   return tx;
    // });
    //
    // const signedTxs = await swapClient.program.provider.wallet.signAllTransactions(txss);
    //
    // for (let k = 0; k < txs.length; k += 1) {
    //   const tx = signedTxs[k];
    //   const rawTx = tx.serialize();
    //   console.log(2222, rawTx.toString('base64'));
    // }

    await swapClient.program.provider.sendAll(txs);
  }, [
    fromMintInfo,
    toMintInfo,
    fair,
    quoteMint,
    quoteMintInfo,
    fromAmount,
    fromMint,
    toMint,
    fromMarket,
    slippage,
    isStrict,
    openOrders,
    toMarket,
    fromWallet,
    toWallet,
    swapClient,
    referral,
    quoteWallet,
  ]);

  return { swap, route };
};
