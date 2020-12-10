import cache from '@civic/simple-cache';
import { AccountLayout, MintLayout, Token as SPLToken, u64 } from '@solana/spl-token';
import {
  Account,
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  PublicKeyAndAccount,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import BufferLayout, { blob, u8 } from 'buffer-layout';
import { Decimal } from 'decimal.js';
import { complement, find, identity, isNil, memoizeWith, path, propEq } from 'ramda';
import assert from 'ts-invariant';

import { getConnection } from 'api/connection';
import {
  getWallet,
  makeTransaction,
  sendTransaction,
  sendTransactionFromAccount,
} from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { airdropKey } from 'config/constants';
import { toDecimal } from 'utils/amount';
import { makeNewAccountInstruction } from 'utils/transaction';
import { ExtendedCluster } from 'utils/types';

import { ACCOUNT_UPDATED_EVENT, AccountListener, AccountUpdateEvent } from './AccountListener';
import { Token } from './Token';
import tokenConfig, { TokenConfig } from './token.config';
import { TokenAccount } from './TokenAccount';

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// TODO: check
export const OWNER_VALIDATION_PROGRAM_ID = new PublicKey(
  '4MNPdKu9wFMvEeZBMt3Eipfs5ovVWTJb31pEXDJAAxX5',
);

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
  getAccountsForToken: (token: Token) => Promise<TokenAccount[]>;
  getAccountsForWallet: () => Promise<TokenAccount[]>;
  createToken: (decimals?: number, mintAuthority?: PublicKey) => Promise<Token>;
  createAccountForToken: (token: Token, owner?: PublicKey) => Promise<TokenAccount>;
  mintTo: (recipient: TokenAccount, tokenAmount: number) => Promise<string>;
  createMint: (amount: number, decimals: number, initialAccount: Account) => Promise<string>;
  airdropToWallet: (token: Token, tokenAmount: number) => Promise<string>;
  transfer: (parameters: TransferParameters) => Promise<string>;
  approveInstruction: (
    sourceAccount: TokenAccount,
    delegate: PublicKey,
    amount: number | Decimal,
  ) => TransactionInstruction;
  approve: (sourceAccount: TokenAccount, delegate: PublicKey, amount: number) => Promise<string>;
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
     * Given a token address, check the config to see if the name and symbol are known for this token
     * @param address
     */
    const getConfigForToken = (address: PublicKey): TokenConfig | null => {
      const clusterConfig = tokenConfig[cluster];

      if (!clusterConfig) {
        return null;
      }

      const configForToken = find(propEq('mintAddress', address.toBase58()), clusterConfig);

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
        configForToken?.tokenName,
        configForToken?.tokenSymbol,
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
        tokenInfo(new PublicKey(tokenConfig.mintAddress)).catch((error) => {
          ToastManager.error(error.toString());
          return null;
        }),
      );

      const tokens = await Promise.all(tokenPromises);

      return tokens.filter(complement(isNil)) as Token[];
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
    };

    const createToken = async (decimals?: number, mintAuthority?: PublicKey) => {
      const mintAccount = new Account();
      const createAccountInstruction = await makeNewAccountInstruction(
        cluster,
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
        cluster,
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
      const balanceNeededMint: number = await SPLToken.getMinBalanceRentForExemptMint(connection);

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

        const balanceNeededAccount: number = await SPLToken.getMinBalanceRentForExemptAccount(
          connection,
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

    function approveInstruction(
      sourceAccount: TokenAccount,
      delegate: PublicKey,
      amount: number | Decimal,
    ) {
      return SPLToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        sourceAccount.address,
        delegate,
        getWallet().pubkey,
        [],
        toU64(amount),
      );
    }

    /**
     * If an airdrop key exists, airdrop tokens to the current wallet
     * This is useful in order to demo token swaps on "dummy tokens" in non-mainnet environments
     * Note - the airdrop key must be a mint authority for the token.
     * @param token The token to mint
     * @param tokenAmount The amount of tokens to mint
     */
    const airdropToWallet = async (token: Token, tokenAmount: number): Promise<string> => {
      const airdropPrivateKey = airdropKey(cluster);
      if (!airdropPrivateKey) {
        throw new Error(`No airdrop key available for ${cluster}`);
      }
      const airdropAccount: Account = new Account(JSON.parse(airdropPrivateKey));

      const tokenAccounts = await getAccountsForToken(token);

      // airdrop SOL so that new accounts can be created
      await connection.requestAirdrop(getWallet().pubkey, 1000000);

      // airdrop SOL to the airdrop key
      await connection.requestAirdrop(airdropAccount.publicKey, 1000000);

      const recipient =
        !tokenAccounts || tokenAccounts.length === 0
          ? await createAccountForToken(token)
          : tokenAccounts[0];

      const mintToInstruction = SPLToken.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        token.address,
        recipient.address,
        airdropAccount.publicKey,
        [],
        tokenAmount,
      );

      const transaction = await makeTransaction([mintToInstruction]);

      return sendTransactionFromAccount(transaction, airdropAccount);
    };

    const approve = async (
      sourceAccount: TokenAccount,
      delegate: PublicKey,
      amount: number,
    ): Promise<string> => {
      const instruction = approveInstruction(sourceAccount, delegate, amount);

      const transaction = await makeTransaction([instruction]);

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

      return sendTransaction(transaction);
    };

    const createAndTransferToAccount = async (
      source: PublicKey,
      destination: PublicKey,
      amount: number,
      mint: PublicKey,
    ): Promise<string> => {
      const newAccount = new Account();

      const instructions = [];

      // AssertOwnerInstruction
      const dataLayout = BufferLayout.struct([blob(32, 'account')]);
      const data = Buffer.alloc(dataLayout.span);
      dataLayout.encode(
        {
          account: SystemProgram.programId.toBuffer(),
        },
        data,
      );
      instructions.push({
        keys: [{ pubkey: destination, isSigner: false, isWritable: false }],
        programId: OWNER_VALIDATION_PROGRAM_ID,
        data,
      });

      const balanceNeededAccount: number = await SPLToken.getMinBalanceRentForExemptAccount(
        connection,
      );

      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: getWallet().pubkey,
          newAccountPubkey: newAccount.publicKey,
          lamports: balanceNeededAccount,
          space: AccountLayout.span,
          programId: TOKEN_PROGRAM_ID,
        }),
      );

      instructions.push(
        SPLToken.createInitAccountInstruction(
          TOKEN_PROGRAM_ID,
          mint,
          newAccount.publicKey,
          destination,
        ),
      );

      // transferBetweenAccountsTxn
      instructions.push(
        SPLToken.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          source,
          newAccount.publicKey,
          getWallet().pubkey,
          [],
          amount,
        ),
      );

      const transaction = await makeTransaction(instructions, [newAccount]);

      return sendTransaction(transaction);
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

      // If account didn't found or lamports equal 0
      if (!destinationAccountInfo || destinationAccountInfo.lamports === 0) {
        throw new Error('Cannot send to address with zero SOL balances');
      }

      // Try to find Token account by SOL address with highest balance
      const destinationSplTokenAccount = (
        await getAccountsForToken(sourceTokenAccountInfo.mint, parameters.destination)
      ).sort((a, b) => b.balance.minus(a.balance).toNumber())[0];

      if (destinationSplTokenAccount) {
        return transferBetweenSplTokenAccounts(
          parameters.source,
          destinationSplTokenAccount.address,
          parameters.amount,
        );
      }

      return createAndTransferToAccount(
        parameters.source,
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

    return {
      getTokens,
      tokenInfo,
      tokenInfoUncached,
      tokenAccountInfo,
      updateTokenAccountInfo,
      createAccountForToken,
      createToken,
      mintTo,
      createMint,
      airdropToWallet,
      transfer,
      approveInstruction,
      approve,
      getAccountsForToken,
      getAccountsForWallet,
      listenToTokenAccountChanges,
    };
  },
);
