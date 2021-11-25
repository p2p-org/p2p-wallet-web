import { createContainer } from 'unstated-next';

export interface UseTokens {}

export interface UseTokensArgs {}

const useTokensInternal = (props: UseTokensArgs): UseTokens => {
  return {};
};

export const { Provider: TokensProvider, useContainer: useTokens } =
  createContainer(useTokensInternal);
