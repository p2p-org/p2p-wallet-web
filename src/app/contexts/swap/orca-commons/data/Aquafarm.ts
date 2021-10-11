import { PublicKey } from '@solana/web3.js';

import { AquafarmConfig, AquafarmJSON } from './../types';

export function createAquafarmConfig(obj: AquafarmJSON): AquafarmConfig {
  return {
    ...obj,
    account: new PublicKey(obj.account),
    tokenProgramId: new PublicKey(obj.tokenProgramId),
    emissionsAuthority: new PublicKey(obj.emissionsAuthority),
    removeRewardsAuthority: new PublicKey(obj.removeRewardsAuthority),
    baseTokenMint: new PublicKey(obj.baseTokenMint),
    baseTokenVault: new PublicKey(obj.baseTokenVault),
    rewardTokenMint: new PublicKey(obj.rewardTokenMint),
    rewardTokenVault: new PublicKey(obj.rewardTokenVault),
    farmTokenMint: new PublicKey(obj.farmTokenMint),
  };
}
