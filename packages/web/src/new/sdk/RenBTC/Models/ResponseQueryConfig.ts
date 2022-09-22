export class ResponseQueryConfig {
  //@ts-ignore
  confirmations: Confirmations;
  //@ts-ignore
  maxConfirmations: Confirmations;
  //@ts-ignore
  network: string;
  //@ts-ignore
  registries: Registries;
  whitelist?: string[];
}

class Confirmations {
  //@ts-ignore
  Bitcoin: string;
  //@ts-ignore
  Ethereum: string;
}

class Registries {
  //@ts-ignore
  Ethereum: string;
}
