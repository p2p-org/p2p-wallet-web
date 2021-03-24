export type TokenConfig = {
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
  icon?: string;
  deprecated?: boolean;
};

type TokensByEntrypointType = {
  [cluster: string]: TokenConfig[];
};

// TODO: change branch to master

export const SOL_AVATAR_URL =
  'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SOL.png';

// eslint-disable-next-line import/no-default-export
export default {
  'mainnet-beta': [
    {
      tokenSymbol: 'WSOL',
      mintAddress: 'So11111111111111111111111111111111111111112',
      tokenName: 'Wrapped Solana',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SOL.png',
    },
    {
      mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      tokenName: 'Serum',
      tokenSymbol: 'SRM',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SRM-MSRM.png',
    },
    {
      mintAddress: 'MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L',
      tokenName: 'MegaSerum',
      tokenSymbol: 'MSRM',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SRM-MSRM.png',
    },
    {
      tokenSymbol: 'BTC',
      mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
      tokenName: 'Wrapped Bitcoin',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/BTC.png',
    },
    {
      tokenSymbol: 'ETH',
      mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
      tokenName: 'Wrapped Ethereum',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/ETH.png',
    },
    {
      tokenSymbol: 'FTT',
      mintAddress: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
      tokenName: 'Wrapped FTT',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/FTX.png',
    },
    {
      tokenSymbol: 'YFI',
      mintAddress: '3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB',
      tokenName: 'Wrapped YFI',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/YFI.png',
    },
    {
      tokenSymbol: 'LINK',
      mintAddress: 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG',
      tokenName: 'Wrapped Chainlink',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/LINK.png',
    },
    {
      tokenSymbol: 'XRP',
      mintAddress: 'Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8',
      tokenName: 'Wrapped XRP',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/XRP.png',
    },
    {
      tokenSymbol: 'WUSDT',
      mintAddress: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
      tokenName: 'Wrapped USDT (Sollet)',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/USDT.png',
    },
    {
      tokenSymbol: 'USDT',
      mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      tokenName: 'USDT',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/USDT.png',
    },
    {
      tokenSymbol: 'USDC',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenName: 'USD Coin',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/USDC.png',
    },
    {
      tokenSymbol: 'WUSDC',
      mintAddress: 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW',
      tokenName: 'Wrapped USD Tether',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/USDC.png',
      deprecated: true,
    },
    {
      tokenSymbol: 'SUSHI',
      mintAddress: 'AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy',
      tokenName: 'Wrapped SUSHI',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SUSHI.png',
    },
    {
      tokenSymbol: 'ALEPH',
      mintAddress: 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K',
      tokenName: 'Wrapped ALEPH',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/ALEPH.png',
    },
    {
      tokenSymbol: 'SXP',
      mintAddress: 'SF3oTvfWzEP3DTwGSvUXRrGTvr75pdZNnBLAH9bzMuX',
      tokenName: 'Wrapped SXP',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SXP.png',
    },
    {
      tokenSymbol: 'HGET',
      mintAddress: 'BtZQfWqDGbk9Wf2rXEiWyQBdBY1etnUUn6zEphvVS7yN',
      tokenName: 'Wrapped HGET',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/HGET.png',
    },
    {
      tokenSymbol: 'CREAM',
      mintAddress: '5Fu5UUgbjpUvdBveb3a1JTNirL8rXtiYeSMWvKjtUNQv',
      tokenName: 'Wrapped CREAM',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/CREAM.png',
    },
    {
      tokenSymbol: 'UBXT',
      mintAddress: '873KLxCbz7s9Kc4ZzgYRtNmhfkQrhfyWGZJBmyCbC3ei',
      tokenName: 'Wrapped UBXT',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/UBXT.png',
    },
    {
      tokenSymbol: 'HNT',
      mintAddress: 'HqB7uswoVg4suaQiDP3wjxob1G5WdZ144zhdStwMCq7e',
      tokenName: 'Wrapped HNT',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/HNT.png',
    },
    {
      tokenSymbol: 'FRONT',
      mintAddress: '9S4t2NEAiJVMvPdRYKVrfJpBafPBLtvbvyS3DecojQHw',
      tokenName: 'Wrapped FRONT',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/FRONT.png',
    },
    {
      tokenSymbol: 'AKRO',
      mintAddress: '6WNVCuxCGJzNjmMZoKyhZJwvJ5tYpsLyAtagzYASqBoF',
      tokenName: 'Wrapped AKRO',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/AKRO.png',
    },
    {
      tokenSymbol: 'HXRO',
      mintAddress: 'DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc',
      tokenName: 'Wrapped HXRO',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/HXRO.png',
    },
    {
      tokenSymbol: 'UNI',
      mintAddress: 'DEhAasscXF4kEGxFgJ3bq4PpVGp5wyUxMRvn6TzGVHaw',
      tokenName: 'Wrapped UNI',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/UNI.png',
    },
    {
      tokenSymbol: 'MATH',
      mintAddress: 'GeDS162t9yGJuLEHPWXXGrb1zwkzinCgRwnT8vHYjKza',
      tokenName: 'Wrapped MATH',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/MATH.png',
    },
    {
      tokenSymbol: 'TOMO',
      mintAddress: 'GXMvfY2jpQctDqZ9RoU3oWPhufKiCcFEfchvYumtX7jd',
      tokenName: 'Wrapped TOMO',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/TOMO.png',
    },
    {
      tokenSymbol: 'LUA',
      mintAddress: 'EqWCKXfs3x47uVosDpTRgFniThL9Y8iCztJaapxbEaVX',
      tokenName: 'Wrapped LUA',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/LUA.png',
    },
  ],
  devnet: [
    {
      tokenSymbol: 'WSOL',
      mintAddress: 'So11111111111111111111111111111111111111112',
      tokenName: 'Solana',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/SOL.png',
    },
    {
      tokenSymbol: 'MY',
      mintAddress: '7ayTz9njQsatFA2dQbYSRQPQBSYnsU4QfT96AZjbs8Uq',
      tokenName: 'My',
      icon:
        'https://raw.githubusercontent.com/p2p-org/p2p-wallet-web/develop/public/assets/images/tokens/logo.png',
    },
  ],
  localnet: [
    {
      mintAddress: 'CY3SLULMHu1gzyXmaGjSQXphV3U3NgA5dWivmN3P2wWj',
      tokenName: 'Token A',
      tokenSymbol: 'TKA',
    },
    {
      mintAddress: 'MqSRFjAkrhtshnrEdC7cneYKWHEyCXiuzSy7NLWqBff',
      tokenName: 'Token B',
      tokenSymbol: 'TKB',
    },
  ],
} as TokensByEntrypointType;
