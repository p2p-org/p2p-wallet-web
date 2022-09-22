export class Network {
  chain: string;
  endpoint: string;
  lightNode: string;
  gatewayRegistry: string;
  genesisHash: string;
  p2shPrefix: number;

  constructor({
    chain,
    endpoint,
    lightNode,
    gatewayRegistry,
    genesisHash,
    p2shPrefix,
  }: {
    chain: string;
    endpoint: string;
    lightNode: string;
    gatewayRegistry: string;
    genesisHash: string;
    p2shPrefix: number;
  }) {
    this.chain = chain;
    this.endpoint = endpoint;
    this.lightNode = lightNode;
    this.gatewayRegistry = gatewayRegistry;
    this.genesisHash = genesisHash;
    this.p2shPrefix = p2shPrefix;
  }

  get isTestnet(): boolean {
    return this.chain !== 'mainnet';
  }

  static get mainnet(): Network {
    return new Network({
      chain: 'mainnet',
      endpoint: 'https://ren.rpcpool.com/',
      lightNode: 'https://lightnode-mainnet.herokuapp.com',
      gatewayRegistry: 'REGrPFKQhRneFFdUV3e9UDdzqUJyS6SKj88GdXFCRd2',
      genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
      p2shPrefix: 0x05,
    });
  }

  static get testnet(): Network {
    return new Network({
      chain: 'testnet',
      endpoint: 'https://api.devnet.solana.com',
      lightNode: 'https://lightnode-testnet.herokuapp.com/',
      gatewayRegistry: 'REGrPFKQhRneFFdUV3e9UDdzqUJyS6SKj88GdXFCRd2',
      genesisHash: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
      p2shPrefix: 0xc4,
    });
  }

  static get devnet(): Network {
    return new Network({
      chain: 'devnet',
      endpoint: 'https://api.testnet.solana.com',
      lightNode: 'https://lightnode-devnet.herokuapp.com',
      gatewayRegistry: 'REGrPFKQhRneFFdUV3e9UDdzqUJyS6SKj88GdXFCRd2',
      genesisHash: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY',
      p2shPrefix: 0xc4,
    });
  }
}
