export type TokenConfig = {
  mintAddress: string;
  tokenName: string;
  wrappedBy?: 'sollet';
  tokenSymbol: string;
  color?: string;
  icon?: string;
  deprecated?: boolean;
};

type TokensByEntrypointType = {
  [cluster: string]: TokenConfig[];
};

// TODO: change branch to master

export const SOL_AVATAR_URL = '/assets/images/tokens/SOL.png';

export const SOL_COLOR = '#6FECB5';

const mainnet = [
  {
    tokenSymbol: 'WSOL',
    mintAddress: 'So11111111111111111111111111111111111111112',
    tokenName: 'Wrapped Solana by Sollet',
    wrappedBy: 'sollet',
    color: SOL_COLOR,
    icon: SOL_AVATAR_URL,
  },
  {
    mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    tokenName: 'Serum',
    tokenSymbol: 'SRM',
    color: '#7FD4E3',
    icon: '/assets/images/tokens/SRM-MSRM.png',
  },
  {
    mintAddress: 'MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L',
    tokenName: 'MegaSerum',
    tokenSymbol: 'MSRM',
    color: '#7FD4E3',
    icon: '/assets/images/tokens/SRM-MSRM.png',
  },
  {
    tokenSymbol: 'BTC',
    mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    tokenName: 'Wrapped Bitcoin by Sollet',
    wrappedBy: 'sollet',
    color: '#FEB150',
    icon: '/assets/images/tokens/BTC.png',
  },
  {
    tokenSymbol: 'ETH',
    mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    tokenName: 'Wrapped Ethereum by Sollet',
    wrappedBy: 'sollet',
    color: '#677DE3',
    icon: '/assets/images/tokens/ETH.png',
  },
  {
    tokenSymbol: 'FTT',
    mintAddress: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
    tokenName: 'Wrapped FTT by Sollet',
    wrappedBy: 'sollet',
    color: '#7FCEE2',
    icon: '/assets/images/tokens/FTX.png',
  },
  {
    tokenSymbol: 'YFI',
    mintAddress: '3JSf5tPeuscJGtaCp5giEiDhv51gQ4v3zWg8DGgyLfAB',
    tokenName: 'Wrapped YFI by Sollet',
    wrappedBy: 'sollet',
    color: '#006AE3',
    icon: '/assets/images/tokens/YFI.png',
  },
  {
    tokenSymbol: 'LINK',
    mintAddress: 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG',
    tokenName: 'Wrapped Chainlink by Sollet',
    wrappedBy: 'sollet',
    color: '#3C5CCB',
    icon: '/assets/images/tokens/LINK.png',
  },
  {
    tokenSymbol: 'XRP',
    mintAddress: 'Ga2AXHpfAF6mv2ekZwcsJFqu7wB4NV331qNH7fW9Nst8',
    tokenName: 'Wrapped XRP by Sollet',
    wrappedBy: 'sollet',
    color: '#24292E',
    icon: '/assets/images/tokens/XRP.png',
  },
  {
    tokenSymbol: 'WUSDT',
    mintAddress: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
    tokenName: 'Wrapped USD Tether by Sollet',
    wrappedBy: 'sollet',
    color: '#4F9E7E',
    icon: '/assets/images/tokens/USDT.png',
  },
  {
    tokenSymbol: 'USDT',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    tokenName: 'USDT',
    color: '#4F9E7E',
    icon: '/assets/images/tokens/USDT.png',
  },
  {
    tokenSymbol: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenName: 'USD Coin',
    color: '#3D73C4',
    icon: '/assets/images/tokens/USDC.png',
  },
  {
    tokenSymbol: 'WUSDC',
    mintAddress: 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW',
    tokenName: 'Wrapped USDC by Sollet',
    wrappedBy: 'sollet',
    color: '#3D73C4',
    icon: '/assets/images/tokens/USDC.png',
    deprecated: true,
  },
  {
    tokenSymbol: 'SUSHI',
    mintAddress: 'AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy',
    tokenName: 'Wrapped SUSHI by Sollet',
    wrappedBy: 'sollet',
    color: '#D765A3',
    icon: '/assets/images/tokens/SUSHI.png',
  },
  {
    tokenSymbol: 'ALEPH',
    mintAddress: 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K',
    tokenName: 'Wrapped ALEPH by Sollet',
    wrappedBy: 'sollet',
    color: '#518BE6',
    icon: '/assets/images/tokens/ALEPH.png',
  },
  {
    tokenSymbol: 'SXP',
    mintAddress: 'SF3oTvfWzEP3DTwGSvUXRrGTvr75pdZNnBLAH9bzMuX',
    tokenName: 'Wrapped SXP by Sollet',
    wrappedBy: 'sollet',
    color: '#FA7850',
    icon: '/assets/images/tokens/SXP.png',
  },
  {
    tokenSymbol: 'HGET',
    mintAddress: 'BtZQfWqDGbk9Wf2rXEiWyQBdBY1etnUUn6zEphvVS7yN',
    tokenName: 'Wrapped HGET by Sollet',
    wrappedBy: 'sollet',
    color: '#F0CA5D',
    icon: '/assets/images/tokens/HGET.png',
  },
  {
    tokenSymbol: 'CREAM',
    mintAddress: '5Fu5UUgbjpUvdBveb3a1JTNirL8rXtiYeSMWvKjtUNQv',
    tokenName: 'Wrapped CREAM by Sollet',
    wrappedBy: 'sollet',
    color: '#89DFDB',
    icon: '/assets/images/tokens/CREAM.png',
  },
  {
    tokenSymbol: 'UBXT',
    mintAddress: '873KLxCbz7s9Kc4ZzgYRtNmhfkQrhfyWGZJBmyCbC3ei',
    tokenName: 'Wrapped UBXT by Sollet',
    wrappedBy: 'sollet',
    color: '#4BA6BA',
    icon: '/assets/images/tokens/UBXT.png',
  },
  {
    tokenSymbol: 'HNT',
    mintAddress: 'HqB7uswoVg4suaQiDP3wjxob1G5WdZ144zhdStwMCq7e',
    tokenName: 'Wrapped HNT by Sollet',
    wrappedBy: 'sollet',
    color: '#57A0F8',
    icon: '/assets/images/tokens/HNT.png',
  },
  {
    tokenSymbol: 'FRONT',
    mintAddress: '9S4t2NEAiJVMvPdRYKVrfJpBafPBLtvbvyS3DecojQHw',
    tokenName: 'Wrapped FRONT by Sollet',
    wrappedBy: 'sollet',
    color: '#473733',
    icon: '/assets/images/tokens/FRONT.png',
  },
  {
    tokenSymbol: 'AKRO',
    mintAddress: '6WNVCuxCGJzNjmMZoKyhZJwvJ5tYpsLyAtagzYASqBoF',
    tokenName: 'Wrapped AKRO by Sollet',
    wrappedBy: 'sollet',
    color: '#B85BF4',
    icon: '/assets/images/tokens/AKRO.png',
  },
  {
    tokenSymbol: 'HXRO',
    mintAddress: 'DJafV9qemGp7mLMEn5wrfqaFwxsbLgUsGVS16zKRk9kc',
    tokenName: 'Wrapped HXRO by Sollet',
    wrappedBy: 'sollet',
    color: '#56B838',
    icon: '/assets/images/tokens/HXRO.png',
  },
  {
    tokenSymbol: 'UNI',
    mintAddress: 'DEhAasscXF4kEGxFgJ3bq4PpVGp5wyUxMRvn6TzGVHaw',
    tokenName: 'Wrapped UNI by Sollet',
    wrappedBy: 'sollet',
    color: '#FBEBF5',
    icon: '/assets/images/tokens/UNI.png',
  },
  {
    tokenSymbol: 'MATH',
    mintAddress: 'GeDS162t9yGJuLEHPWXXGrb1zwkzinCgRwnT8vHYjKza',
    tokenName: 'Wrapped MATH by Sollet',
    wrappedBy: 'sollet',
    color: '#000000',
    icon: '/assets/images/tokens/MATH.png',
  },
  {
    tokenSymbol: 'TOMO',
    mintAddress: 'GXMvfY2jpQctDqZ9RoU3oWPhufKiCcFEfchvYumtX7jd',
    tokenName: 'Wrapped TOMO by Sollet',
    wrappedBy: 'sollet',
    color: '#252829',
    icon: '/assets/images/tokens/TOMO.png',
  },
  {
    tokenSymbol: 'LUA',
    mintAddress: 'EqWCKXfs3x47uVosDpTRgFniThL9Y8iCztJaapxbEaVX',
    tokenName: 'Wrapped LUA by Sollet',
    wrappedBy: 'sollet',
    color: '#F1BE5C',
    icon: '/assets/images/tokens/LUA.png',
  },
];

// eslint-disable-next-line import/no-default-export
export default {
  'p2p-mainnet': mainnet,
  'p2p-2-mainnet': mainnet,
  'serum-mainnet': mainnet,
  'mainnet-beta': mainnet,
  devnet: [
    {
      tokenSymbol: 'WSOL',
      mintAddress: 'So11111111111111111111111111111111111111112',
      tokenName: 'Solana',
      color: SOL_COLOR,
      icon: SOL_AVATAR_URL,
    },
    {
      tokenSymbol: 'MY',
      mintAddress: '7ayTz9njQsatFA2dQbYSRQPQBSYnsU4QfT96AZjbs8Uq',
      tokenName: 'My',
      icon: '/assets/images/tokens/logo.png',
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
