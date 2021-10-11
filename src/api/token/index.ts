import { AccountLayout, MintLayout, Token as SPLToken } from '@solana/spl-token';
import { TokenInfo } from '@solana/spl-token-registry';
import {
  Account,
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { complement, find, isNil, memoizeWith, path, propEq, splitEvery, toString } from 'ramda';
import assert from 'ts-invariant';

import { getConnection } from 'api/connection';
import { retryableProxy } from 'api/connection/utils/retryableProxy';
import { getWallet, makeTransaction, sendTransaction } from 'api/wallet';
import { SOL_MINT } from 'app/contexts/swapSerum';
import { NetworkType } from 'config/constants';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { CacheTTL } from 'lib/cachettl';
import { toDecimal } from 'utils/amount';
import { makeNewAccountInstruction } from 'utils/transaction';

import { ACCOUNT_UPDATED_EVENT, AccountListener, AccountUpdateEvent } from './AccountListener';
import colors from './colors.config';
import { Token } from './Token';
import tokenList from './token.config';
import { TokenAccount } from './TokenAccount';

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
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

type TokenAccountUpdateCallback = (tokenAccount: TokenAccount) => void;

export type TransferParameters = {
  source: PublicKey;
  destination: PublicKey;
  amount: number;
};

export interface API {
  getTokens: () => Promise<Token[]>;
  tokenInfo: (mint: PublicKey) => Promise<Token>;
  tokenInfoUncached: (mint: PublicKey) => Promise<Token>;
  tokenAccountInfo: (account: PublicKey) => Promise<TokenAccount | null>;
  updateTokenAccountInfo: (tokenAccount: TokenAccount) => Promise<TokenAccount | null>;
  tokensInfo: (mints: PublicKey[]) => Promise<Token[]>;
  tokensAccountsInfo: (mints: PublicKey[]) => Promise<TokenAccount[]>;
  getAccountsForToken: (token: Token) => Promise<TokenAccount[]>;
  getAccountsForWallet: (owner?: PublicKey) => Promise<TokenAccount[]>;
  getConfigForToken: (address: PublicKey) => TokenInfo | null;
  precacheTokenAccounts: (owner: PublicKey) => Promise<void>;
  createToken: (decimals?: number, mintAuthority?: PublicKey) => Promise<Token>;
  createAccountForToken: (token: Token, owner?: PublicKey) => Promise<TokenAccount>;
  mintTo: (recipient: TokenAccount, tokenAmount: number) => Promise<string>;
  createMint: (amount: number, decimals: number, initialAccount: Account) => Promise<string>;
  transfer: (parameters: TransferParameters) => Promise<string>;
  approveInstruction: (
    sourceAccount: TokenAccount,
    delegate: PublicKey,
    amount: number,
  ) => TransactionInstruction;
  approve: (sourceAccount: TokenAccount, delegate: PublicKey, amount: number) => Promise<string>;
  listenToTokenAccountChanges: (
    accounts: Array<TokenAccount>,
    callback: TokenAccountUpdateCallback,
  ) => AccountListener;
  closeAccount: (publicKey: PublicKey) => Promise<string>;
}

const mintTo = async (recipient: TokenAccount, tokenAmount: number): Promise<string> => {
  const token = recipient.mint;
  assert(
    token.mintAuthority && getWallet().pubkey.equals(token.mintAuthority),
    `The current wallet does not have the authority to mint tokens for mint ${token}`,
  );

  const mintToInstruction = SPLToken.createMintToInstruction(
    TOKEN_PROGRAM_ID,
    token.address,
    recipient.address,
    getWallet().pubkey,
    [],
    tokenAmount,
  );

  const transaction = await makeTransaction([mintToInstruction]);

  return sendTransaction(transaction);
};

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
export const APIFactory = memoizeWith(
  toString,
  (network: NetworkType): API => {
    const connection = getConnection(network);
    const payer = new Account();

    /**
     * Given a token address, check the config to see if the name and symbol are known for this token
     * @param address
     */
    const getConfigForToken = (address: PublicKey): TokenInfo | null => {
      const clusterConfig = tokenList.filterByClusterSlug(network.cluster).getList();

      if (!clusterConfig) {
        return null;
      }

      if (
        network.cluster === 'devnet' &&
        address.toBase58() === 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD'
      ) {
        return {
          chainId: 101,
          address: 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD',
          name: 'renBTC',
          decimals: 8,
          symbol: 'renBTC',
        };
      }
      const configForToken = find(propEq('address', address.toBase58()), clusterConfig);

      if (!configForToken) {
        return null;
      }

      return configForToken;
    };

    /**
     * The output from the solana web3 library when parsing the on-chain data
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

    type GetMultipleAccountsResultType = RpcResponseAndContext<AccountInfo<
      Buffer | ParsedAccountData
    > | null>;

    const getMultipleAccounts = async (mints: PublicKey[]) => {
      const publicKeys = mints.map((publicKey) => publicKey.toBase58());
      const chunks = splitEvery(100, publicKeys);

      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const getMultipleAccountsResult: GetMultipleAccountsResultType = {};
          await connection._rpcRequest('getMultipleAccounts', [
            chunk,
            { commitment: connection.commitment, encoding: 'jsonParsed' },
          ]);

          return path<AccountInfo<Buffer | ParsedAccountData>[] | null>(
            ['result', 'value'],
            getMultipleAccountsResult,
          );
        }),
      );

      return results.reduce((prev, cur) => {
        if (cur) {
          return prev?.concat(cur);
        }

        return prev;
      }, []);
    };

    const tokensInfo = retryableProxy<PublicKey[], Token[]>(async (mints: PublicKey[]) => {
      const result = await getMultipleAccounts(mints);

      const tokens: Token[] = [];

      mints.forEach((mint, index) => {
        const mintInfo = path<{
          decimals: number;
          supply: number;
          mintAuthority: string;
        }>([index, 'data', 'parsed', 'info'], result);

        if (!mintInfo) {
          return;
        }

        const configForToken = getConfigForToken(mint);

        const token = new Token(
          mint,
          mintInfo.decimals,
          mintInfo.supply,
          mintInfo.mintAuthority ? new PublicKey(mintInfo.mintAuthority) : undefined, // maps a null mintAuthority to undefined
          configForToken?.name,
          configForToken?.symbol,
          configForToken?.symbol && colors[configForToken.symbol],
          configForToken?.logoURI,
        );

        // set cache
        tokensCache.set(mint.toBase58(), token);

        tokens.push(token);
      });

      return tokens;
    });

    const tokensAccountsInfo = retryableProxy<PublicKey[], TokenAccount[]>(
      async (mints: PublicKey[]) => {
        const result = await getMultipleAccounts(mints);

        const tokens: TokenAccount[] = [];

        mints.forEach(async (mint, index) => {
          const ownerProgram =
            path<string>([index, 'owner'], result) || TOKEN_PROGRAM_ID.toBase58();
          const accountInfo = path<{
            isNative: boolean;
            mint: string;
            owner: string;
            state: string;
            tokenAmount: {
              amount: string;
              decimals: number;
            };
          }>([index, 'data', 'parsed', 'info'], result);
          if (!accountInfo) {
            return;
          }

          const mintTokenInfo = await tokenInfo(new PublicKey(accountInfo.mint));

          const tokenAccount = new TokenAccount(
            mintTokenInfo,
            new PublicKey(accountInfo.owner),
            new PublicKey(ownerProgram),
            mint,
            toDecimal(new BN(accountInfo.tokenAmount.amount)),
          );

          tokens.push(tokenAccount);
        });

        return tokens;
      },
    );

    const getTokens = async (): Promise<Token[]> => {
      const clusterConfig = tokenList
        .filterByClusterSlug(network.cluster)
        .excludeByTag('nft')
        .excludeByTag('leveraged')
        .excludeByTag('bull')
        .excludeByTag('lp-token')
        .getList();

      if (!clusterConfig) {
        return [];
      }

      const tokensAddresses = clusterConfig.map(
        (config: TokenInfo) => new PublicKey(config.address),
      );

      return tokensInfo(tokensAddresses);
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
          new PublicKey(parsedInfo.owner),
          getParsedAccountInfoResult.value?.owner,
          account,
          toDecimal(new BN(parsedInfo.tokenAmount.amount)),
          false,
          getParsedAccountInfoResult.context.slot,
        );
      }

      const mintTokenInfo = getConfigForToken(WRAPPED_SOL_MINT);

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

        return new TokenAccount(mint, SYSTEM_PROGRAM_ID, SYSTEM_PROGRAM_ID, account, balance);
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
          SYSTEM_PROGRAM_ID,
          account,
          getParsedAccountInfoResult.value?.lamports,
        );
      }

      return null;
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
    const getAccountsForWallet = async (owner?: PublicKey): Promise<TokenAccount[]> => {
      const ownerKey = owner || getWallet().pubkey;

      console.log('Token program ID', TOKEN_PROGRAM_ID.toBase58());
      const allParsedAccountInfos = await connection
        .getParsedTokenAccountsByOwner(ownerKey, {
          programId: TOKEN_PROGRAM_ID,
        })
        .catch((error) => {
          console.error(`Error getting accounts for ${ownerKey.toBase58()}`, error);
          throw error;
        });

      // const res = await connection._rpcRequest('getProgramAccounts', [
      //   TOKEN_PROGRAM_ID.toBase58(),
      //   {
      //     commitment: connection.commitment,
      //     filters: [
      //       {
      //         memcmp: {
      //           offset: AccountLayout.offsetOf('owner'),
      //           bytes: ownerKey.toBase58(),
      //         },
      //       },
      //       {
      //         dataSize: AccountLayout.span,
      //       },
      //     ],
      //     // encoding: 'jsonParsed',
      //   },
      // ]);

      const secondTokenAccount = async (accountResult: {
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData>;
      }): Promise<TokenAccount | null> => {
        const parsedTokenAccountInfo = extractParsedTokenAccountInfo(accountResult.account);

        if (!parsedTokenAccountInfo) {
          return null;
        }

        const mintAddress = new PublicKey(parsedTokenAccountInfo.mint);
        const token = await tokenInfo(mintAddress);

        return new TokenAccount(
          token,
          new PublicKey(parsedTokenAccountInfo.owner),
          accountResult.account.owner,
          accountResult.pubkey,
          toDecimal(new BN(parsedTokenAccountInfo.tokenAmount.amount)),
        );
      };

      const mints: PublicKey[] = [];

      allParsedAccountInfos.value.forEach((accountResult) => {
        const parsedTokenAccountInfo = extractParsedTokenAccountInfo(accountResult.account);

        if (!parsedTokenAccountInfo) {
          return;
        }

        mints.push(new PublicKey(parsedTokenAccountInfo.mint));
      });

      await tokensInfo(mints);

      const allTokenAccounts = await Promise.all(
        allParsedAccountInfos.value.map((account) => secondTokenAccount(account)),
      );

      return allTokenAccounts.filter(complement(isNil)) as TokenAccount[];
    };

    const precacheTokenAccounts = async (owner: PublicKey) => {
      const tokenAccounts = await getAccountsForWallet(owner);

      tokenAccounts.forEach((tokenAccount) => {
        tokenAccountsPrecache.set(tokenAccount.address.toBase58(), tokenAccount);
      });
    };

    /**
     * Get the wallet's accounts for a token
     * @param token
     * @param owner
     */
    const getAccountsForToken = async (
      token: Token,
      owner?: PublicKey,
    ): Promise<TokenAccount[]> => {
      console.log("Finding the wallet's accounts for the token", {
        wallet: { address: getWallet().pubkey.toBase58() },
        token: {
          address: token.address.toBase58(),
        },
      });

      const allAccounts = await getAccountsForWallet(owner);
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

      return accountListener;
    };

    const createToken = async (decimals?: number, mintAuthority?: PublicKey) => {
      const mintAccount = new Account();
      const createAccountInstruction = await makeNewAccountInstruction(
        network,
        mintAccount.publicKey,
        MintLayout,
        TOKEN_PROGRAM_ID,
      );

      // the mint authority (who can create tokens) defaults to the wallet.
      // For Pools, it should be set to the pool token authority
      const mintAuthorityKey = mintAuthority || getWallet().pubkey;
      const initMintInstruction = SPLToken.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        decimals || 2,
        mintAuthorityKey,
        null,
      );

      const transaction = await makeTransaction(
        [createAccountInstruction, initMintInstruction],
        [mintAccount],
      );

      console.log('creating token');
      await sendTransaction(transaction);

      return tokenInfo(mintAccount.publicKey);
    };

    /**
     * Create a Token account for this token, owned by the passed-in owner,
     * or the wallet
     * @param {Token} token The token to create an account for
     * @param {PublicKey} [owner] The optional owner of the created token account
     */
    const createAccountForToken = async (
      token: Token,
      owner?: PublicKey, // defaults to the wallet - used to create accounts owned by a Pool
    ): Promise<TokenAccount> => {
      console.log('Creating an account on the wallet for the token', {
        wallet: { address: getWallet().pubkey.toBase58() },
        token: {
          address: token.address.toBase58(),
        },
      });

      // ensure the token actually exists before going any further
      const checkToken = await tokenInfo(token.address);
      console.log('Creating an account for token', checkToken.toString());

      // if no recipient is set, use the wallet
      const ownerKey = owner || getWallet().pubkey;

      // this is the new token account.
      // It will be assigned to the current wallet in the initAccount instruction
      const newAccount = new Account();
      console.log('New token account owner', {
        address: newAccount.publicKey.toBase58(),
        owner: ownerKey.toBase58(),
      });

      // Instruction to create a new Solana account
      const createAccountInstruction = await makeNewAccountInstruction(
        network,
        newAccount.publicKey,
        AccountLayout,
        TOKEN_PROGRAM_ID,
      );

      // Instruction to assign the new account to the token program
      const initTokenAccountInstruction = SPLToken.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        token.address,
        newAccount.publicKey,
        ownerKey,
      );

      const transaction = await makeTransaction(
        [createAccountInstruction, initTokenAccountInstruction],
        [newAccount],
      );

      await sendTransaction(transaction);

      const updatedInfo = await tokenAccountInfo(newAccount.publicKey);

      if (!updatedInfo) {
        throw new Error('Unable to retrieve the created token account');
      }

      return updatedInfo;
    };

    const createMint = async (
      amount: number,
      decimals: number,
      initialAccount: Account,
    ): Promise<string> => {
      const mintAccount = new Account();
      // const token = new SPLToken(connection, mintAccount.publicKey, programId, payer);

      // Allocate memory for the account
      const balanceNeededMint = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

      const instructions = [];

      // createMintAccountInstruction
      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: getWallet().pubkey,
          newAccountPubkey: mintAccount.publicKey,
          lamports: balanceNeededMint,
          space: MintLayout.span,
          programId: TOKEN_PROGRAM_ID,
        }),
      );

      // createInitMintInstruction
      instructions.push(
        SPLToken.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mintAccount.publicKey,
          decimals,
          getWallet().pubkey,
          null,
        ),
      );

      const signers = [mintAccount];

      if (amount > 0) {
        signers.push(initialAccount);

        const balanceNeededAccount = await connection.getMinimumBalanceForRentExemption(
          AccountLayout.span,
        );

        // createAccountInstruction
        instructions.push(
          SystemProgram.createAccount({
            fromPubkey: getWallet().pubkey,
            newAccountPubkey: initialAccount.publicKey,
            lamports: balanceNeededAccount,
            space: AccountLayout.span,
            programId: TOKEN_PROGRAM_ID,
          }),
        );

        // createInitAccountInstruction
        instructions.push(
          SPLToken.createInitAccountInstruction(
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            initialAccount.publicKey,
            getWallet().pubkey,
          ),
        );

        // createMintToInstruction
        instructions.push(
          SPLToken.createMintToInstruction(
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            initialAccount.publicKey,
            getWallet().pubkey,
            [],
            amount,
          ),
        );
      }

      const transaction = await makeTransaction(instructions, signers);

      return sendTransaction(transaction);
    };

    function approveInstruction(sourceAccount: TokenAccount, delegate: PublicKey, amount: number) {
      return SPLToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        sourceAccount.address,
        delegate,
        getWallet().pubkey,
        [],
        amount,
      );
    }

    const approve = async (
      sourceAccount: TokenAccount,
      delegate: PublicKey,
      amount: number,
    ): Promise<string> => {
      const instruction = approveInstruction(sourceAccount, delegate, amount);

      const transaction = await makeTransaction([instruction]);

      return sendTransaction(transaction);
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
      getTokens,
      tokenInfo,
      tokenInfoUncached,
      tokensInfo,
      tokenAccountInfo,
      tokensAccountsInfo,
      updateTokenAccountInfo,
      createAccountForToken,
      createToken,
      mintTo,
      createMint,
      transfer,
      approveInstruction,
      approve,
      getAccountsForToken,
      getAccountsForWallet,
      getConfigForToken,
      precacheTokenAccounts,
      listenToTokenAccountChanges,
      closeAccount,
    };
  },
);
