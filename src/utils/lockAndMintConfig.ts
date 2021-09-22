export type MintConfig = {
  expiryTime: number;
  createdAt: number;
  nonce: string;
};
type LocalConfigs = {
  [key: string]: MintConfig;
};

const LOCK_AND_MINT_CONFIG_KEY = 'lockAndMintConfig';

export const getSessionDay = () => Math.floor(Date.now() / 1000 / 60 / 60 / 24);
export const getSessionExpiry = () => (getSessionDay() + 3) * 60 * 60 * 24 * 1000;
export const getNonce = () =>
  Buffer.from(getSessionDay().toString(16).padStart(32)).toString('hex');

export function loadConfig(): LocalConfigs | null {
  const localConfig = localStorage.getItem(LOCK_AND_MINT_CONFIG_KEY) as string;

  if (!localConfig) {
    return null;
  }

  let config;
  try {
    config = JSON.parse(localConfig);
  } catch (error) {
    console.error(error);
  }

  return config;
}

export function loadAndDeleteExpired(pubKey: string): MintConfig | null {
  const config = loadConfig();
  if (!config || !config[pubKey]) {
    return null;
  }

  if (Math.ceil(config[pubKey].expiryTime - 24 * 60 * 60 * 1000 - Number(new Date())) <= 0) {
    delete config[pubKey];
    localStorage.setItem(LOCK_AND_MINT_CONFIG_KEY, JSON.stringify(config));
    return null;
  }

  return config[pubKey];
}

export function saveConfig(pubKey: string, config: MintConfig) {
  let localConfig = loadConfig();
  if (!localConfig) {
    localConfig = {
      [pubKey]: config,
    };
  } else {
    localConfig[pubKey] = config;
  }
  localStorage.setItem(LOCK_AND_MINT_CONFIG_KEY, JSON.stringify(localConfig));
}

export function initConfig(pubKey: string): MintConfig {
  const config = {
    expiryTime: getSessionExpiry(),
    createdAt: Date.now(),
    nonce: getNonce(),
  };
  saveConfig(pubKey, config);
  return config;
}
