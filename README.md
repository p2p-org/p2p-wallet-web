# P2P Wallet Prototype

![](https://cdn.discordapp.com/attachments/737610668726812763/777332772540645376/wallets_web2x.png)

A Open Source Browser Based Solana Wallet. Version "0.1a Wormhole Hackathon"
Built on top of [Solana](https://github.com/solana-labs), [ProjectSerum](https://github.com/project-serum)

Live demo available at [github-pages](https://p2p-org.github.io/p2p-wallet-web/)

P2P Wallet Prototype supports a number features such as:

- Create/Access Wallet with seed. Your private keys are only stored on your current computer or device.
- Create Wrapped tokens addresses
- Displaying balances of SOL token and Wrapped tokens
- Displaying the value of assets in dollars.
- Send and receive SOL token and Wrapped tokens
- Transaction history
- Transaction details
- HD (BIP32,BIP39) support
- QR code generation
- Nice UI

### Further development:

- One-tap access to swap assets
- Improving security
- Wallet Connect integration
- Send/Receive Wrapped tokens to/from Ethereum Blockchain
- DeFi support

# Project overview

We use `lerna` to manage packages which are residing under the `packages` directory. To lint and format our code, such tools as `eslint` and `prettier` are used.
```
p2p-wallet-web
├── .github
├── .husky
├── node_modules
├── src
└── packages
    ├── core
    ├── eslint-config
    ├── eslint-config-react
    ├── example
    ├── sail
    ├── tsconfig
    ├── ui
    └── web
```

Packages bear the following purposes:
- `core`          : all general-purpose logic, including type definitions, app-wide context providers, etc.
- `eslint-config` : `eslint` general configuration
- `eslint-config-react` : `eslint` configuration for React-specific code
- `sail`     : a collection of custom hooks and other application-wide logic
- `tsconfig` : Typescript configurations
- `ui`       : a collection of commonly used components and `storybook`   to view them in the browser.
- `web`      : wallet web interface


## Build it yourself

If you'd rather build the application yourself, please ensure you have nodejs/npm/yarn already installed locally.

- Clone the repo 

``` 
git clone https://github.com/p2p-org/p2p-wallet-web.git
```

- Install dependencies with `yarn`.

```
cd p2p-wallet-web
yarn
```

- Project uses `lerna` for package management. You will need to build the packages first before starting development.

```
yarn build
```

- Rename `.env.development.example` in the `web` package to `.env.development` and fill it with your environmental variables.

```
cd packages/web
mv .env.development.example .env.development
```

- Once packages have been built, you can start the project locally. Open [http://localhost:3000/](http://localhost:3000/) to see it in the browser.
 If having build errors, make sure that your `Node.js` version is at least `v11` or higher .

```
cd packages/web
yarn start
```

- To start storybook change directory to `packages/ui` and start the storybook server. Open [http://localhost:6006/](http://localhost:6006/) to see it in the browser.

```
cd packages/ui
yarn storybook
```

# Development

Install the following extensions in your code editor for linting and ease of work with the code:

- eslint
- prettier
- stylelint
- linaria

# Contributing

The best way to submit feedback and report bugs is to open a GitHub issue. Please be sure to include your operating system, device, version number, and steps to reproduce reported bugs. Keep in mind that all participants will be expected to follow our code of conduct.
