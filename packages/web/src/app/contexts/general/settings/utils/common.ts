export const toggleTokenAccount = (publicKey: string, tokenAccounts: string[]): string[] => {
  const newTokenAccounts = [...tokenAccounts];

  if (newTokenAccounts.includes(publicKey)) {
    return newTokenAccounts.filter((newPublicKey) => newPublicKey !== publicKey);
  }

  newTokenAccounts.push(publicKey);

  return newTokenAccounts;
};
