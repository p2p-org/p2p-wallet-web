declare module '@civic/simple-cache' {
  type Opts = {
    ttl: numbber;
  };

  function cache<T>(fn: (...args: Array<any>) => T, opts: Opts): typeof fn;
  export = cache;
}
