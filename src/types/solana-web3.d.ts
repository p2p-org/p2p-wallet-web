declare module '@solana/web3.js' {
  export class Connection {
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
    _rpcRequest(methodName: string, args: Array<any>): any;
  }
}
