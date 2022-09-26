import type { Layout } from '@project-serum/borsh';
import { array, bool, publicKey, struct, u8, u64 as u64borsh, vec } from '@project-serum/borsh';
import { generateSHash } from '@renproject/utils';
import { fromBase64 } from '@renproject/utils/internal/common';
import { keccak256 } from '@renproject/utils/module/internal/hashes';
import { Token, u64 } from '@solana/spl-token';
import type { AccountInfo as BufferInfo } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';
import base58 from 'bs58';

import type { SolanaSDK } from 'new/sdk/SolanaSDK';
import {
  getAssociatedTokenAddressSync,
  MintInfo,
  SolanaSDKError,
  SolanaSDKPublicKey,
} from 'new/sdk/SolanaSDK';

import { BurnDetails } from '../../actions/BurnAndRelease';
import type { ResponseQueryTxMint } from '../../models';
import { Direction, RenVMError } from '../../models';
import type { RenVMRpcClientType } from '../../RPCClient';
import { fixSignatureSimple } from '../../utils/Hash';
import { RenVMChainType } from '../RenVMChainType';
import { RenProgram } from './SolanaChainRenProgram';

export class SolanaChain extends RenVMChainType {
  // Constants
  static gatewayRegistryStateKey = 'GatewayRegistryState';
  gatewayStateKey = 'GatewayStateV0.1.4';
  chainName = 'Solana';

  // Properties
  gatewayRegistryData: GatewayRegistryData;
  client: RenVMRpcClientType;
  apiClient: SolanaSDK;

  constructor({
    gatewayRegistryData,
    client,
    apiClient,
  }: {
    gatewayRegistryData: GatewayRegistryData;
    client: RenVMRpcClientType;
    apiClient: SolanaSDK;
  }) {
    super();

    this.gatewayRegistryData = gatewayRegistryData;
    this.client = client;
    this.apiClient = apiClient;
  }

  // Methods

  static async load({
    client,
    apiClient,
  }: {
    client: RenVMRpcClientType;
    apiClient: SolanaSDK;
    // TODO: apiClient and blockchainClient after SolanaSDK decomposition
  }): Promise<SolanaChain> {
    const pubkey = new PublicKey(client.network.gatewayRegistry);
    const stateKey = PublicKey.findProgramAddressSync(
      [Buffer.from(this.gatewayRegistryStateKey)],
      pubkey,
    );
    const result = await apiClient.getAccountInfo<GatewayRegistryData | null>({
      account: stateKey[0]!.toString(),
      decodedTo: GatewayRegistryDataLayout,
    });

    const data = result?.data;
    if (!data) {
      throw SolanaSDKError.couldNotRetrieveAccountInfo();
    }

    return new SolanaChain({
      gatewayRegistryData: data,
      client,
      apiClient,
    });
  }

  resolveTokenGatewayContract(mintTokenSymbol: string): PublicKey {
    let sHash: PublicKey | undefined;
    try {
      sHash = new PublicKey(
        base58.encode(
          generateSHash(
            this.selector({
              mintTokenSymbol,
              direction: Direction.to,
            }).toString(),
          ),
        ),
      );
    } catch {
      // ignore
    }
    if (!sHash) {
      throw new RenVMError('Could not resolve token gateway contract');
    }

    const index = this.gatewayRegistryData.selectors.findIndex((s) =>
      sHash ? Buffer.from(s).equals(sHash.toBuffer()) : false,
    );
    if (index === -1 || this.gatewayRegistryData.gateways.length <= index) {
      throw new RenVMError('Could not resolve token gateway contract');
    }
    return this.gatewayRegistryData.gateways[index]!;
  }

  getSPLTokenPubkey(mintTokenSymbol: string): PublicKey {
    const program = this.resolveTokenGatewayContract(mintTokenSymbol);
    const sHash = generateSHash(
      this.selector({ mintTokenSymbol, direction: Direction.to }).toString(),
    );
    return PublicKey.findProgramAddressSync([Buffer.from(sHash)], program)[0];
  }

  getAssociatedTokenAddress({
    address,
    mintTokenSymbol,
  }: {
    address: Uint8Array;
    mintTokenSymbol: string;
  }): Uint8Array {
    const tokenMint = this.getSPLTokenPubkey(mintTokenSymbol);
    return getAssociatedTokenAddressSync(tokenMint, new PublicKey(address)).toBytes();
  }

  dataToAddress(data: Uint8Array): string {
    return base58.encode(data);
  }

  signatureToData(signature: string): Uint8Array {
    return Uint8Array.from(base58.decode(signature)); // TODO: maybe Buffer
  }

  async createAssociatedTokenAccount({
    address,
    mintTokenSymbol,
    owner,
  }: {
    address: PublicKey;
    mintTokenSymbol: string;
    owner: PublicKey; // instead of signer
  }): Promise<string> {
    const tokenMint = this.getSPLTokenPubkey(mintTokenSymbol);
    const createAccountInstruction = Token.createAssociatedTokenAccountInstruction(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
      tokenMint,
      getAssociatedTokenAddressSync(tokenMint, address),
      address,
      owner,
    );

    // TODO: check it works, maybe we need to hack like with create renBTC
    const preparedTransaction = await this.apiClient.prepareTransaction({
      instructions: [createAccountInstruction],
      owner, // instead of signers
      feePayer: owner,
    });

    return this.apiClient.sendTransaction({
      preparedTransaction,
    });
  }

  async submitMint({
    address,
    mintTokenSymbol,
    account,
    responseQueryMint,
  }: {
    address: Uint8Array;
    mintTokenSymbol: string;
    account: Uint8Array; // instead of signer
    responseQueryMint: ResponseQueryTxMint;
  }): Promise<string> {
    const pHash = fromBase64(responseQueryMint.valueIn.phash);
    const nHash = fromBase64(responseQueryMint.valueIn.nhash);
    const amount = responseQueryMint.valueOut.amount;
    if (!pHash || !nHash || !amount) {
      throw RenVMError.paramsMissing();
    }

    const sHash = generateSHash(
      this.selector({ mintTokenSymbol, direction: Direction.to }).toString(),
    );

    const _sig = responseQueryMint.valueOut.sig;
    if (!_sig) {
      throw RenVMError.paramsMissing();
    }

    const _siga = Buffer.from(fromBase64(_sig));
    // TODO: this looks weird, check it
    const fixedSig = fixSignatureSimple(_siga);
    const sig = Buffer.from(fixedSig); // just clone
    const program = this.resolveTokenGatewayContract(mintTokenSymbol);
    const gatewayAccountId: PublicKey = PublicKey.findProgramAddressSync(
      [Buffer.from(this.gatewayStateKey)],
      program,
    )[0];
    const tokenMint = this.getSPLTokenPubkey(mintTokenSymbol);
    const mintAuthority: PublicKey = PublicKey.findProgramAddressSync(
      [tokenMint.toBuffer()],
      program,
    )[0];
    const recipientTokenAccount = new PublicKey(
      this.getAssociatedTokenAddress({
        address,
        mintTokenSymbol,
      }),
    );
    const renVMMessage = SolanaChain.buildRenVMMessage({
      pHash,
      amount,
      token: sHash,
      to: recipientTokenAccount,
      nHash,
    });
    const mintLogAccount: PublicKey = PublicKey.findProgramAddressSync(
      [keccak256(renVMMessage)],
      program,
    )[0];

    const mintInstruction = RenProgram.mintInstruction({
      account: new PublicKey(account),
      gatewayAccount: gatewayAccountId,
      tokenMint,
      recipientTokenAccount,
      mintLogAccount,
      mintAuthority,
      programId: program,
    });

    const response: BufferInfo<GatewayStateData | null> | null =
      await this.apiClient.getAccountInfo({
        account: gatewayAccountId.toString(),
        decodedTo: GatewayStateDataLayout,
      });

    const gatewayState = response?.data;
    if (!gatewayState) {
      throw SolanaSDKError.couldNotRetrieveAccountInfo();
    }

    const secpInstruction = RenProgram.createInstructionWithEthAddress2({
      ethAddress: Buffer.from(gatewayState.renVMAuthority),
      message: renVMMessage,
      signature: sig.slice(0, 64),
      recoveryId: sig[64]! - 27,
    });

    const preparedTransaction = await this.apiClient.prepareTransaction({
      instructions: [mintInstruction, secpInstruction],
      owner: new PublicKey(account),
      feePayer: new PublicKey(account),
    });
    return this.apiClient.sendTransaction({
      preparedTransaction,
    });
  }

  async submitBurn({
    mintTokenSymbol,
    account,
    amount,
    recipient,
  }: {
    mintTokenSymbol: string;
    account: Uint8Array; // instead of signer
    amount: string;
    recipient: string;
  }): Promise<BurnDetails> {
    const amountNew = new u64(amount);
    // TODO: condition to throw
    if (!amountNew) {
      throw RenVMError.other('Amount is not valid');
    }
    const accountNew = new PublicKey(account);
    const program = this.resolveTokenGatewayContract(mintTokenSymbol);
    const tokenMint = this.getSPLTokenPubkey(mintTokenSymbol);
    const source = new PublicKey(
      this.getAssociatedTokenAddress({
        address: accountNew.toBytes(),
        mintTokenSymbol,
      }),
    );
    const gatewayAccountId = PublicKey.findProgramAddressSync(
      [Buffer.from(this.gatewayStateKey)],
      program,
    )[0];

    const response: BufferInfo<GatewayStateData | null> | null =
      await this.apiClient.getAccountInfo({
        account: gatewayAccountId.toString(),
        decodedTo: GatewayStateDataLayout,
      });

    const gatewayState = response?.data;
    if (!gatewayState) {
      throw SolanaSDKError.couldNotRetrieveAccountInfo();
    }

    const nonce = gatewayState.burnCount.addn(1);
    const burnLogAccountId = PublicKey.findProgramAddressSync([nonce.toBuffer()], program)[0];

    // @ts-ignore
    const burnCheckedInstruction = Token.createBurnCheckedInstruction(
      SolanaSDKPublicKey.tokenProgramId,
      tokenMint,
      source,
      accountNew,
      [],
      amountNew,
      8,
    );

    const burnInstruction = RenProgram.burnInstruction({
      account: accountNew,
      source,
      gatewayAccount: gatewayAccountId,
      tokenMint,
      burnLogAccountId,
      recipient: Buffer.from(recipient),
      programId: program,
    });

    const preparedTransaction = await this.apiClient.prepareTransaction({
      instructions: [burnCheckedInstruction, burnInstruction],
      owner: accountNew,
      feePayer: accountNew,
    });

    const signature = await this.apiClient.sendTransaction({
      preparedTransaction,
    });

    return new BurnDetails({
      confirmedSignature: signature,
      nonce,
      recipient,
      amount,
    });
  }

  async findMintByDepositDetail({
    nHash,
    pHash,
    to,
    mintTokenSymbol,
    amount,
  }: {
    nHash: Uint8Array;
    pHash: Uint8Array;
    to: PublicKey;
    mintTokenSymbol: string;
    amount: string;
  }): Promise<string> {
    const program = this.resolveTokenGatewayContract(mintTokenSymbol);
    const sHash = generateSHash(
      this.selector({ mintTokenSymbol, direction: Direction.to }).toString(),
    );
    const renVMMessage = SolanaChain.buildRenVMMessage({ pHash, amount, token: sHash, to, nHash });

    const mintLogAccount = PublicKey.findProgramAddressSync([keccak256(renVMMessage)], program)[0];
    const bufferInfo: BufferInfo<MintInfo | null> | null = await this.apiClient.getAccountInfo({
      account: mintLogAccount.toString(),
      decodedTo: MintInfo,
    });
    const mint = bufferInfo?.data;
    if (!mint) {
      throw RenVMError.other('Invalid mint info');
    }

    if (!mint.isInitialized) {
      return '';
    }

    const signatures = await this.apiClient.provider.connection.getSignaturesForAddress(
      mintLogAccount,
    );

    return signatures[0]?.signature ?? '';
  }

  async waitForConfirmation(signature: string): Promise<void> {
    // TODO: ignore status
    return this.apiClient.waitForConfirmation(signature);
  }

  isAlreadyMintedError(error: Error): boolean {
    console.error(error);
    // TODO:
    // response.data?.logs?.contains(
    // starts(with: "Allocate: account Address { address: ") &&
    //             hasSuffix("} already in use")
    throw new Error('do it');
  }

  // Static methods

  static buildRenVMMessage({
    pHash,
    amount,
    token,
    to,
    nHash,
  }: {
    pHash: Uint8Array;
    amount: string;
    token: Uint8Array;
    to: PublicKey;
    nHash: Uint8Array;
  }): Buffer {
    const preencode = {
      pHash: new Uint8Array(pHash),
      amount: new Uint8Array(new BN(amount).toArray('be', 32)),
      token: new Uint8Array(token),
      to: new Uint8Array(to.toBuffer()),
      nHash: new Uint8Array(nHash),
    };

    // form data
    return Buffer.from([
      ...preencode.pHash,
      ...preencode.amount,
      ...preencode.token,
      ...preencode.to,
      ...preencode.nHash,
    ]);
  }
}

interface GatewayStateData {
  isInitialized: boolean;
  /// RenVM Authority is the Eth compatible address of RenVM's authority key. RenVM mint
  /// instructions require a ECDSA over Secp256k1 mint signature signed by the authority key.
  renVMAuthority: Uint8Array;
  /// Keccak256 hash of the RenVM selector for the gateway's token
  selectors: Uint8Array;
  /// The number of burn operations that have happened so far. This is incremented whenever Ren
  /// tokens on Solana are burned.
  burnCount: u64;
  /// The number of decimals in the underlying asset.
  underlyingDecimals: u64;
}

// https://github.dev/renproject/ren-js/blob/5791e7b9ed3a8d64cf8581f78161eb13f218a13f/packages/lib/chains/chains-solana/src/layouts.ts#L74
const GatewayStateDataLayout: Layout<GatewayStateData> = struct([
  bool('isInitialized'),
  array(u8(), 20, 'renVMAuthority'),
  array(u8(), 32, 'selectors'),
  u64borsh('burnCount'),
  u8('underlyingDecimals'),
]);

interface GatewayRegistryData {
  isInitialized: boolean;
  /// Owner is the pubkey that's allowed to write data to the registry state.
  owner: PublicKey;
  /// Number of selectors/gateway addresses stored in the registry.
  count: u64;
  /// RenVM selector hashes.
  selectors: Uint8Array[];
  /// RenVM gateway program addresses.
  gateways: PublicKey[];
}

//github.dev/renproject/ren-js/blob/5791e7b9ed3a8d64cf8581f78161eb13f218a13f/packages/lib/chains/chains-solana/src/layouts.ts#L84
const GatewayRegistryDataLayout: Layout<GatewayRegistryData> = struct([
  bool('isInitialized'),
  publicKey('owner'),
  u64borsh('count'),
  vec(array(u8(), 32), 'selectors'),
  vec(publicKey(), 'gateways'),
]);
