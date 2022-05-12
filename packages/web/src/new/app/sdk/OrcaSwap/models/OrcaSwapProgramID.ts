export type OrcaSwapProgramIDResponse = {
  serumTokenSwap: string;
  tokenSwapV2: string;
  tokenSwap: string;
  token: string;
  aquafarm: string;
};

export class OrcaSwapProgramID {
  constructor(
    public serumTokenSwap: string,
    public tokenSwapV2: string,
    public tokenSwap: string,
    public token: string,
    public aquafarm?: string,
  ) {}

  static fromNetwork(response: OrcaSwapProgramIDResponse): OrcaSwapProgramID {
    return new OrcaSwapProgramID(
      response.serumTokenSwap,
      response.tokenSwapV2,
      response.tokenSwap,
      response.token,
      response.aquafarm,
    );
  }
}
