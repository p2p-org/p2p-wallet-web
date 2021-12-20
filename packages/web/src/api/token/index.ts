import { SYSTEM_PROGRAM_ID } from '@p2p-wallet-web/core';
import { NATIVE_MINT, Token as SPLToken, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { TokenInfo } from '@solana/spl-token-registry';
import type { AccountInfo, ParsedAccountData } from '@solana/web3.js';
import { Account, PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { find, memoizeWith, path, propEq, toString } from 'ramda';

import { getConnection } from 'api/connection';
import { SOL_MINT } from 'app/contexts/swap';
import type { NetworkObj } from 'config/constants';
import { CacheTTL } from 'lib/cachettl';
import { toDecimal } from 'utils/amount';

import colors from './colors.config';
import { Token } from './Token';
import tokenList from './token.config';
import { TokenAccount } from './TokenAccount';

export const ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

// Check that was pass same owner
// https://github.com/project-serum/serum-dex/tree/master/assert-owner
export const OWNER_VALIDATION_PROGRAM_ID = new PublicKey(
  '4MNPdKu9wFMvEeZBMt3Eipfs5ovVWTJb31pEXDJAAxX5',
);

const tokensCache = new Map<string, Token>();

// uses for precache SWAP_HOST_FEE_ADDRESS token accounts
export const tokenAccountsPrecache = new CacheTTL<TokenAccount>();

export type TransferParameters = {
  source: PublicKey;
  destination: PublicKey;
  amount: number;
};

export interface API {
  tokenInfo: (mint: PublicKey) => Promise<Token>;
  tokenInfoUncached: (mint: PublicKey) => Promise<Token>;
  tokenAccountInfo: (account: PublicKey) => Promise<TokenAccount | null>;
  getConfigForToken: (address: PublicKey) => TokenInfo | null;
  transfer: (parameters: TransferParameters) => Promise<string>;
  closeAccount: (publicKey: PublicKey) => Promise<string>;
}

const transferSol = async (parameters: TransferParameters): Promise<string> => {
  console.log('Transfer SOL amount', parameters.amount);

  const transferInstruction = SystemProgram.transfer({
    fromPubkey: parameters.source,
    toPubkey: parameters.destination,
    lamports: parameters.amount,
  });

  const transaction = await makeTransaction([transferInstruction]);

  return sendTransaction(transaction, false);
};

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(toString, (network: NetworkObj): API => {
  const connection = getConnection(network);
  const payer = new Account();

  /**
   * Given a token address, check the config to see if the name and symbol are known for this token
   * @param address
   */
  const getConfigForToken = (address: PublicKey): TokenInfo | null => {
    const clusterConfig = tokenList.filterByClusterSlug(network.network).getList();

    if (!clusterConfig) {
      return null;
    }

    if (
      network.network === 'devnet' &&
      address.toBase58() === 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD'
    ) {
      return {
        chainId: 101,
        address: 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD',
        name: 'renBTC',
        decimals: 8,
        symbol: 'RENBTC',
      };
    }
    const configForToken = find(propEq('address', address.toBase58()), clusterConfig);

    if (!configForToken) {
      return null;
    }

    return configForToken;
  };

  /**
   * The output from the blockchain web3 library when parsing the on-chain data
   * for an spl token account
   */
  type ParsedTokenAccountInfo = {
    mint: string;
    owner: string;
    tokenAmount: { amount: string; decimals: number; uiAmount: number };
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

    const configForToken = getConfigForToken(mint);

    return new Token(
      mint,
      mintInfo.decimals,
      mintInfo.supply,
      mintInfo.mintAuthority || undefined, // maps a null mintAuthority to undefined
      configForToken?.name,
      configForToken?.symbol,
      configForToken?.symbol && colors[configForToken.symbol],
      configForToken?.logoURI,
    );
  };

  /**
   * Given a mint address, return its token information
   * @param mint
   */
  const tokenInfo = async (mint: PublicKey): Promise<Token> => {
    // try to get cached version
    const tokenCached = tokensCache.get(mint.toBase58());
    if (tokenCached) {
      return tokenCached;
    }

    const tokenUncached = await tokenInfoUncached(mint);

    // set cache
    tokensCache.set(mint.toBase58(), tokenUncached);

    return tokenUncached;
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
    console.log('Getting info for token account:', account.toBase58());
    const getParsedAccountInfoResult = await connection.getParsedAccountInfo(account);

    // For Tokens
    if (getParsedAccountInfoResult.value?.owner.equals(TOKEN_PROGRAM_ID)) {
      const parsedInfo = extractParsedTokenAccountInfo(getParsedAccountInfoResult.value);

      // this account does not appear to be a token account
      if (!parsedInfo) {
        return null;
      }

      const mintTokenInfo = await tokenInfo(new PublicKey(parsedInfo.mint));

      return new TokenAccount(
        mintTokenInfo,
        new PublicKey(parsedInfo.owner), // getParsedAccountInfoResult.value?.owner
        account,
        toDecimal(new BN(parsedInfo.tokenAmount.amount)),
        false,
        getParsedAccountInfoResult.context.slot,
      );
    }

    const mintTokenInfo = getConfigForToken(NATIVE_MINT);

    // For SOL simulated token
    if (account.equals(getWallet().pubkey)) {
      const balance = await connection.getBalance(account);
      const mint = new Token(
        SOL_MINT,
        9,
        0,
        undefined,
        'Solana',
        'SOL',
        colors.SOL,
        mintTokenInfo?.logoURI,
      );

      return new TokenAccount(mint, SYSTEM_PROGRAM_ID, account, balance);
    }

    // For SOL tokens
    if (getParsedAccountInfoResult.value?.owner.equals(SYSTEM_PROGRAM_ID)) {
      const mint = new Token(
        SOL_MINT,
        9,
        0,
        undefined,
        'Solana',
        'SOL',
        colors.SOL,
        mintTokenInfo?.logoURI,
      );

      return new TokenAccount(
        mint,
        SYSTEM_PROGRAM_ID,
        account,
        getParsedAccountInfoResult.value?.lamports,
      );
    }

    return null;
  };

  const transferBetweenSplTokenAccounts = async (
    source: PublicKey,
    destination: PublicKey,
    amount: number,
  ): Promise<string> => {
    const transferInstruction = SPLToken.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      source,
      destination,
      getWallet().pubkey,
      [],
      amount,
    );

    const transaction = await makeTransaction([transferInstruction]);

    return sendTransaction(transaction, false);
  };

  const createAndTransferToAssociatedTokenAccount = async (
    source: PublicKey,
    associatedTokenAddress: PublicKey,
    associatedTokenOwner: PublicKey,
    amount: number,
    mint: PublicKey,
  ): Promise<string> => {
    const instructions = [];

    instructions.push(
      SPLToken.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        associatedTokenAddress,
        associatedTokenOwner,
        getWallet().pubkey,
      ),
    );

    instructions.push(
      SPLToken.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        source,
        associatedTokenAddress,
        getWallet().pubkey,
        [],
        amount,
      ),
    );

    const transaction = await makeTransaction(instructions);

    return sendTransaction(transaction, false);
  };

  const transferTokens = async (parameters: TransferParameters): Promise<string> => {
    // Get info about token with mint
    const sourceTokenAccountInfo = await tokenAccountInfo(parameters.source);

    // If this token doesn't exists
    if (!sourceTokenAccountInfo) {
      throw new Error(`Token doesn't exits`);
    }

    // Get info about destination address
    const destinationAccountInfo = await connection.getAccountInfo(parameters.destination);

    // If it's founded and spl token
    if (destinationAccountInfo && destinationAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      return transferBetweenSplTokenAccounts(
        parameters.source,
        parameters.destination,
        parameters.amount,
      );
    }

    const associatedTokenAddress = await SPLToken.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      sourceTokenAccountInfo.mint.address,
      parameters.destination,
    );

    const associatedTokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);

    if (associatedTokenAccountInfo && associatedTokenAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      return transferBetweenSplTokenAccounts(
        parameters.source,
        associatedTokenAddress,
        parameters.amount,
      );
    }

    return createAndTransferToAssociatedTokenAccount(
      parameters.source,
      associatedTokenAddress,
      parameters.destination,
      parameters.amount,
      sourceTokenAccountInfo.mint.address,
    );
  };

  const transfer = async (parameters: TransferParameters): Promise<string> => {
    if (parameters.source.equals(getWallet().pubkey)) {
      return transferSol(parameters);
    }

    return transferTokens(parameters);
  };

  const closeAccount = async (publicKey: PublicKey): Promise<string> => {
    const closeAccountInstruction = SPLToken.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      publicKey,
      getWallet().pubkey,
      getWallet().pubkey,
      [],
    );

    const transaction = await makeTransaction([closeAccountInstruction]);

    return sendTransaction(transaction, false);
  };

  return {
    tokenInfo,
    tokenInfoUncached,
    tokenAccountInfo,
    transfer,
    getConfigForToken,
    closeAccount,
  };
});
