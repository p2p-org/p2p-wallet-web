export type OrcaSwapTokensResponse = {
  mint: string;
  name: string;
  decimals: number;
  fetchPrice?: boolean;
  poolToken?: boolean;
  wrapper?: string;
  identifier?: string;
};

export type OrcaSwapTokens = Record<string, OrcaSwapToken>;

export class OrcaSwapToken {
  constructor(
    public mint: string,
    public name: string,
    public decimals: number,
    public fetchPrice?: boolean,
    public poolToken?: boolean,
    public wrapped?: string,
  ) {}

  static fromNetwork(response: OrcaSwapTokensResponse): OrcaSwapToken {
    return new OrcaSwapToken(
      response.mint,
      response.name,
      response.decimals,
      response.fetchPrice,
      response.poolToken,
      response.wrapper,
    );
  }
}
