import cache from '@civic/simple-cache';
import { AccountLayout, MintLayout, Token as SPLToken, u64 } from '@solana/spl-token';
import {
  Account,
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  PublicKeyAndAccount,
  TokenAmount,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { Decimal } from 'decimal.js';
import { complement, find, identity, isNil, memoizeWith, path, propEq } from 'ramda';

import { getConnection } from 'api/connection';
import { Transaction } from 'api/transaction/Transaction';
import { getWallet } from 'api/wallet';
import { toDecimal } from 'utils/amount';
import { ExtendedCluster } from 'utils/types';

import { ACCOUNT_UPDATED_EVENT, AccountListener, AccountUpdateEvent } from './AccountListener';
import { Token } from './Token';
import tokenConfig, { TokenConfig } from './token.config';
import { TokenAccount } from './TokenAccount';

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

type TokenAccountUpdateCallback = (tokenAccount: TokenAccount) => void;

export interface API {
  getTokens: () => Promise<Token[]>;
  tokenInfo: (mint: PublicKey) => Promise<Token>;
  tokenInfoUncached: (mint: PublicKey) => Promise<Token>;
  tokenAccountInfo: (account: PublicKey) => Promise<TokenAccount | null>;
  updateTokenAccountInfo: (tokenAccount: TokenAccount) => Promise<TokenAccount | null>;
  getTransactionsForToken: (token: Token) => Promise<Transaction[]>;
  getAccountsForWallet: () => Promise<TokenAccount[]>;
  listenToTokenAccountChanges: (
    accounts: Array<TokenAccount>,
    callback: TokenAccountUpdateCallback,
  ) => void;
}

// eslint-disable-next-line new-cap
const toU64 = (number: Decimal | number) => new u64(`${number}`);

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const connection = getConnection(cluster);
    const payer = new Account();

    /**
     * The output from the solana web3 library when parsing the on-chain data
     * for an spl token account
     */
    type ParsedTokenAccountInfo = {
      mint: string;
      tokenAmount: TokenAmount;
    };

    /**
     * Given a mint address, look up its token information
     * sdirectly from the blockchain. Use only if you need
     * up-to-date supply info, otherwise use tokenInfo.
     */
    const tokenInfoUncached = async (mint: PublicKey): Promise<Token> => {
      const token = new SPLToken(connection, mint, TOKEN_PROGRAM_ID, payer);

      console.log('Getting info for', mint.toBase58());

      const mintInfo = await token.getMintInfo().catch((error) => {
        console.error(`Error getting details for ${mint.toBase58()}`, error);
        throw error;
      });

      return new Token(
        mint,
        mintInfo.decimals,
        mintInfo.supply,
        mintInfo.mintAuthority || undefined, // maps a null mintAuthority to undefined
        // configForToken?.tokenName,
        // configForToken?.tokenSymbol,
      );
    };

    /**
     * Given a mint address, return its token information
     * @param mint
     */
    const tokenInfo = cache(tokenInfoUncached, { ttl: 5000 });

    const getTokens = async (): Promise<Token[]> => {
      const clusterConfig = tokenConfig[cluster];

      if (!clusterConfig) {
        return [];
      }

      const tokenPromises = clusterConfig.map((tokenConfig: TokenConfig) =>
        tokenInfo(new PublicKey(tokenConfig.mintAddress)),
      );

      return Promise.all(tokenPromises);
    };

    type GetAccountInfoResponse = AccountInfo<Buffer | ParsedAccountData> | null;

    const extractParsedTokenAccountInfo = (
      parsedAccountInfoResult: GetAccountInfoResponse,
    ): ParsedTokenAccountInfo | undefined =>
      path(['data', 'parsed', 'info'], parsedAccountInfoResult);

    /**
     * Given a token account address, look up its mint and balance
     * @param account
     */
    const tokenAccountInfo = async (account: PublicKey): Promise<TokenAccount | null> => {
      const getParsedAccountInfoResult = await connection.getParsedAccountInfo(account);

      const parsedInfo = extractParsedTokenAccountInfo(getParsedAccountInfoResult.value);

      // this account does not appear to be a token account
      if (!parsedInfo) {
        return null;
      }

      const mintTokenInfo = await tokenInfo(new PublicKey(parsedInfo.mint));

      return new TokenAccount(
        mintTokenInfo,
        account,
        toDecimal(new BN(parsedInfo.tokenAmount.amount)),
        getParsedAccountInfoResult.context.slot,
      );
    };

    const updateTokenAccountInfo = async (tokenAccount: TokenAccount) => {
      const updatedTokenAccount = await tokenAccountInfo(tokenAccount.address);

      if (!updatedTokenAccount) {
        return null;
      }

      updatedTokenAccount.setPrevious(tokenAccount);

      return updatedTokenAccount;
    };

    /**
     * Get all token accounts for this wallet
     */
    const getAccountsForWallet = async (): Promise<TokenAccount[]> => {
      console.log('Token program ID', TOKEN_PROGRAM_ID.toBase58());
      const allParsedAccountInfos = await connection
        .getParsedTokenAccountsByOwner(getWallet().pubkey, {
          programId: TOKEN_PROGRAM_ID,
        })
        .catch((error) => {
          console.error(`Error getting accounts for ${getWallet().pubkey.toBase58()}`, error);
          throw error;
        });

      const secondTokenAccount = async (
        accountResult: PublicKeyAndAccount<Buffer | ParsedAccountData>,
      ): Promise<TokenAccount | null> => {
        const parsedTokenAccountInfo = extractParsedTokenAccountInfo(accountResult.account);

        if (!parsedTokenAccountInfo) {
          return null;
        }

        const mintAddress = new PublicKey(parsedTokenAccountInfo.mint);
        const token = await tokenInfo(mintAddress);

        return new TokenAccount(
          token,
          accountResult.pubkey,
          toDecimal(new BN(parsedTokenAccountInfo.tokenAmount.amount)),
        );
      };

      const allTokenAccounts = await Promise.all(
        allParsedAccountInfos.value.map((account) => secondTokenAccount(account)),
      );

      return allTokenAccounts.filter(complement(isNil)) as TokenAccount[];
    };

    /**
     * Get transactions for a token
     * @param token
     */
    const getTransactionsForToken = async (token: Token): Promise<Transaction[]> => {
      console.log('Finding transactions for the token', {
        token: {
          address: token.address.toBase58(),
        },
      });

      const allAccounts = await getAccountsForWallet();
      return allAccounts.filter(propEq('mint', token));
    };

    const listenToTokenAccountChanges = (
      accounts: Array<TokenAccount>,
      callback: TokenAccountUpdateCallback,
    ) => {
      const accountListener = new AccountListener(connection);

      accounts.map((account) => accountListener.listenTo(account));

      accountListener.on(ACCOUNT_UPDATED_EVENT, async (event: AccountUpdateEvent) => {
        const updatedAccount = await updateTokenAccountInfo(event.tokenAccount);

        if (updatedAccount) {
          callback(updatedAccount);
        }
      });
    };

    return {
      getTokens,
      tokenInfo,
      tokenInfoUncached,
      tokenAccountInfo,
      updateTokenAccountInfo,
      getTransactionsForToken,
      getAccountsForWallet,
      listenToTokenAccountChanges,
    };
  },
);
