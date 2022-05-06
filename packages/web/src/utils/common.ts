export const sleep: (ms: number) => Promise<void> = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const getAvatarSize = (isMobile: boolean) => (isMobile ? 32 : 44);
