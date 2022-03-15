declare module 'react-solana-jazzicon' {
  import type * as React from 'react';

  type JazziconProps = {
    diameter?: number;
    paperStyles?: object;
    seed?: number;
    svgStyles?: object;
  };

  const JazziconSolana: React.FunctionComponent<JazziconProps>;

  export function jsNumberForAddress(address: string): number;

  export default JazziconSolana;
}
