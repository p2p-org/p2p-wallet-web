import { Connection, PublicKey } from '@solana/web3.js';

import { sleep } from 'utils/common';

export const airdropTo = async (
  connection: Connection,
  recipient: PublicKey,
  lamports = 8000000,
  ignoreError = true,
): Promise<void> => {
  let retries = 60;

  const oldBalance = await connection.getBalance(recipient);

  await connection.requestAirdrop(recipient, lamports);
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(500);
    // eslint-disable-next-line no-await-in-loop
    const newBalance = await connection.getBalance(recipient);
    if (lamports === newBalance - oldBalance) {
      return;
    }
    if (--retries <= 0) {
      break;
    }
  }

  if (!ignoreError) throw new Error(`Airdrop of ${lamports} failed`);
};
