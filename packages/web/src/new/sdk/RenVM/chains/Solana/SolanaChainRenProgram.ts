import { toBuffer } from '@renproject/chains-solana/build/main/util';
import { assert } from '@renproject/utils';
import type { CreateSecp256k1InstructionWithEthAddressParams, PublicKey } from '@solana/web3.js';
import { Secp256k1Program, TransactionInstruction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import BufferLayout from 'buffer-layout';

import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

const SECP256K1_INSTRUCTION_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('numSignatures'),
  BufferLayout.u16('signatureOffset'),
  BufferLayout.u8('signatureInstructionIndex'),
  BufferLayout.u16('ethAddressOffset'),
  BufferLayout.u8('ethAddressInstructionIndex'),
  BufferLayout.u16('messageDataOffset'),
  BufferLayout.u16('messageDataSize'),
  BufferLayout.u8('messageInstructionIndex'),
  BufferLayout.blob(21, 'ethAddress'),
  BufferLayout.blob(64, 'signature'),
  BufferLayout.u8('recoveryId'),
]);

export class RenProgram {
  static ETHEREUM_ADDRESS_BYTES = 20;
  static SIGNATURE_OFFSETS_SERIALIZED_SIZE = 11;

  static mintInstruction({
    account,
    gatewayAccount,
    tokenMint,
    recipientTokenAccount,
    mintLogAccount,
    mintAuthority,
    programId,
  }: {
    account: PublicKey;
    gatewayAccount: PublicKey;
    tokenMint: PublicKey;
    recipientTokenAccount: PublicKey;
    mintLogAccount: PublicKey;
    mintAuthority: PublicKey;
    programId: PublicKey;
  }): TransactionInstruction {
    return new TransactionInstruction({
      keys: [
        { pubkey: account, isSigner: true, isWritable: false },
        { pubkey: gatewayAccount, isSigner: false, isWritable: false },
        { pubkey: tokenMint, isSigner: false, isWritable: true },
        { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
        { pubkey: mintLogAccount, isSigner: false, isWritable: true },
        { pubkey: mintAuthority, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.programId, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.sysvarInstruction, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.sysvarRent, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.tokenProgramId, isSigner: false, isWritable: false },
      ],
      programId,
      data: Buffer.from([1]),
    });
  }

  /**
   * Create an secp256k1 instruction with an Ethereum address.
   *
   * We need to add an extra byte to the ethAddress to match our secp offset
   * */
  static createInstructionWithEthAddress2({
    ethAddress: rawAddress,
    message,
    signature,
    recoveryId,
  }: CreateSecp256k1InstructionWithEthAddressParams): TransactionInstruction {
    let ethAddress;
    if (typeof rawAddress === 'string') {
      if (rawAddress.startsWith('0x')) {
        ethAddress = Buffer.from(rawAddress.substr(2), 'hex');
      } else {
        ethAddress = Buffer.from(rawAddress, 'hex');
      }
    } else {
      ethAddress = rawAddress;
    }
    const ethAddressLength: number = ethAddress.length;
    assert(
      ethAddress.length === this.ETHEREUM_ADDRESS_BYTES,
      `Address must be ${this.ETHEREUM_ADDRESS_BYTES} bytes but received ${ethAddressLength} bytes`,
    );
    const dataStart = 1 + this.SIGNATURE_OFFSETS_SERIALIZED_SIZE;
    const ethAddressOffset = dataStart + 1;
    const signatureOffset = ethAddressOffset + ethAddressLength;
    const messageDataOffset = signatureOffset + signature.length + 1;
    const numSignatures = 1;
    const instructionData = Buffer.alloc(
      Number(SECP256K1_INSTRUCTION_LAYOUT.span) + message.length,
    );
    SECP256K1_INSTRUCTION_LAYOUT.encode(
      {
        numSignatures,
        signatureOffset,
        signatureInstructionIndex: 1,
        ethAddressOffset,
        ethAddressInstructionIndex: 1,
        messageDataOffset,
        messageDataSize: message.length,
        messageInstructionIndex: 1,
        signature: toBuffer(signature),
        ethAddress: toBuffer([0, ...ethAddress]),
        recoveryId,
      },
      instructionData,
    );
    instructionData.fill(toBuffer(message), SECP256K1_INSTRUCTION_LAYOUT.span);

    return new TransactionInstruction({
      keys: [],
      programId: Secp256k1Program.programId,
      data: instructionData,
    });
  }

  static burnInstruction({
    account,
    source,
    gatewayAccount,
    tokenMint,
    burnLogAccountId,
    recipient,
    programId,
  }: {
    account: PublicKey;
    source: PublicKey;
    gatewayAccount: PublicKey;
    tokenMint: PublicKey;
    burnLogAccountId: PublicKey;
    recipient: Buffer;
    programId: PublicKey;
  }): TransactionInstruction {
    return new TransactionInstruction({
      keys: [
        { pubkey: account, isSigner: true, isWritable: false },
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: gatewayAccount, isSigner: false, isWritable: true },
        { pubkey: tokenMint, isSigner: false, isWritable: true },
        { pubkey: burnLogAccountId, isSigner: false, isWritable: true },
        { pubkey: SolanaSDKPublicKey.programId, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.sysvarInstruction, isSigner: false, isWritable: false },
        { pubkey: SolanaSDKPublicKey.sysvarRent, isSigner: false, isWritable: false },
      ],
      programId,
      data: Buffer.from([2, recipient.length, ...recipient]),
    });
  }
}
