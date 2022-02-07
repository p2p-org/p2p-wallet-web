import { deriveAssociatedTokenAddress, ZERO } from '@orca-so/sdk';
import type { ConnectedWallet } from '@saberhq/use-solana';
import type { u64 } from '@solana/spl-token';
import { AccountLayout } from '@solana/spl-token';
import type { Connection, PublicKey, Transaction } from '@solana/web3.js';
import BigDecimal from 'decimal.js';

import type { ProgramIds, Route } from '../config';
import { ZERO_DECIMAL } from '../constants';
import type { TokenConfigs } from '../orca-commons';
import type { TradeablePoolsMap } from '../pools';
import type { UserTokenAccountMap } from '../user';
import { getSignature, sendAndConfirm, sendAndConfirmFast } from '../utils/transactions';
import TransactionBuilder from '../utils/web3/TransactionBuilder';
import type SlippageTolerance from './SlippageTolerance';
import type TradeablePoolInterface from './TradeablePoolInterface';
import { OutputTooHighError } from './TradeablePoolInterface';

type TradeParameters = {
  inputTokenName: string;
  outputTokenName: string;
  slippageTolerance: SlippageTolerance;
  routes: Route[];
  amount: u64;
  isInputAmount: boolean;
  outputTooHigh: boolean;
  tokenConfigs: TokenConfigs;
  pools?: TradeablePoolsMap;
  derivedFields?: DerivedFields;
};

type DerivedFields = {
  otherAmount: u64;
  baseOutputAmount: u64;
  minimumOutputAmount: u64;
  exchangeRate: BigDecimal;
  priceImpact: BigDecimal;
  fees: u64[]; // fees is the amount paid to LPs, denominated in the swap's output token
  selectedRoute: Route;
  doubleHopFields: DoubleHopFields | null;
};

type DoubleHopFields = {
  intermediateTokenName: string;
  intermediateOutputAmount: u64;
  minimumIntermediateOutputAmount: u64;
};

// Trade is an immutable struct that stores metadata about the current trade.
// This class must remain immutable in order to be used correctly
// with React's `useState` hook.
export default class Trade {
  inputTokenName: string;
  outputTokenName: string;
  slippageTolerance: SlippageTolerance;
  routes: Route[];
  amount: u64;
  isInputAmount: boolean;
  outputTooHigh: boolean;
  tokenConfigs: TokenConfigs;
  pools: TradeablePoolsMap | undefined;
  derivedFields: DerivedFields | undefined;

  constructor(parameters: TradeParameters) {
    this.inputTokenName = parameters.inputTokenName;
    this.outputTokenName = parameters.outputTokenName;
    this.slippageTolerance = parameters.slippageTolerance;
    this.routes = parameters.routes;
    this.amount = parameters.amount;
    this.isInputAmount = parameters.isInputAmount;
    this.outputTooHigh = parameters.outputTooHigh;
    this.derivedFields = parameters.derivedFields;
    this.tokenConfigs = parameters.tokenConfigs;
    this.pools = parameters.pools;
    Object.freeze(this);
  }

  getInputAmount(): u64 {
    if (this.isInputAmount) {
      return this.amount;
    } else if (this.derivedFields) {
      return this.derivedFields.otherAmount;
    } else {
      return ZERO;
    }
  }

  getOutputAmount(): u64 {
    if (!this.isInputAmount) {
      return this.amount;
    } else if (this.derivedFields) {
      return this.derivedFields.otherAmount;
    } else {
      return ZERO;
    }
  }

  getBaseOutputAmount() {
    return this.derivedFields?.baseOutputAmount || ZERO;
  }

  getMinimumOutputAmount() {
    return this.derivedFields?.minimumOutputAmount || ZERO;
  }

  getExchangeRate() {
    return this.derivedFields?.exchangeRate || ZERO_DECIMAL;
  }

  getPriceImpact() {
    return this.derivedFields?.priceImpact || ZERO_DECIMAL;
  }

  getFees(): u64[] {
    return this.derivedFields?.fees || [ZERO];
  }

  getIntermediateTokenName() {
    return this.derivedFields?.doubleHopFields?.intermediateTokenName;
  }

  getPoolFromSelectedRoute(poolIndex: number): TradeablePoolInterface | undefined {
    const poolId = this.derivedFields?.selectedRoute[poolIndex];
    return poolId ? this.pools?.[poolId] : undefined;
  }

  isPriceImpactHigh() {
    const priceImpactThreshold = new BigDecimal(1);
    return this.getPriceImpact().greaterThanOrEqualTo(priceImpactThreshold);
  }

  updatePools(pools: TradeablePoolsMap) {
    return deriveTrade({ ...this, pools });
  }

  updateInputToken(inputTokenName: string, routes: Route[]): Trade {
    return deriveTrade({
      ...this,
      inputTokenName,
      routes,
      amount: this.isInputAmount ? ZERO : this.amount,
      pools: null,
    });
  }

  updateOutputToken(outputTokenName: string, routes: Route[]): Trade {
    return deriveTrade({
      ...this,
      outputTokenName,
      routes,
      amount: this.isInputAmount ? this.amount : ZERO,
      pools: null,
    });
  }

  switchTokens(): Trade {
    return deriveTrade({
      ...this,
      inputTokenName: this.outputTokenName,
      outputTokenName: this.inputTokenName,
      isInputAmount: !this.isInputAmount,
    });
  }

  clearAmounts(): Trade {
    return deriveTrade({ ...this, amount: ZERO });
  }

  updateInputAmount(inputAmount: u64): Trade {
    return deriveTrade({ ...this, amount: inputAmount, isInputAmount: true });
  }

  updateOutputAmount(outputAmount: u64): Trade {
    return deriveTrade({ ...this, amount: outputAmount, isInputAmount: false });
  }

  updateSlippageTolerance(slippageTolerance: SlippageTolerance): Trade {
    return deriveTrade({ ...this, slippageTolerance });
  }

  getTokenNamesToSetup(userStandardTokenAccounts: UserTokenAccountMap): string[] {
    const tokenNames = [];

    const intermediateTokenName = this.getIntermediateTokenName();
    if (
      intermediateTokenName &&
      intermediateTokenName !== 'SOL' &&
      !userStandardTokenAccounts[intermediateTokenName]
    ) {
      tokenNames.push(intermediateTokenName);
    }

    if (this.outputTokenName !== 'SOL' && !userStandardTokenAccounts[this.outputTokenName]) {
      tokenNames.push(this.outputTokenName);
    }

    return tokenNames;
  }

  async prepareExchangeTransactions(
    connection: Connection,
    tokenConfigs: TokenConfigs,
    programIds: ProgramIds,
    walletPublicKey: PublicKey,
    inputUserTokenPublicKey: PublicKey,
    intermediateUserTokenPublicKey: PublicKey | undefined,
    outputUserTokenPublicKey: PublicKey | undefined,
  ): Promise<{
    setupTransaction: Transaction | undefined;
    swapTransaction: Transaction;
  }> {
    if (!this.pools || !this.derivedFields) {
      throw new Error('Can not initiate an exchange before retrieving the loader');
    }

    const setupTransactionBuilder = new TransactionBuilder();

    const intermediateTokenName = this.getIntermediateTokenName();
    if (
      intermediateTokenName &&
      intermediateTokenName !== 'SOL' &&
      !intermediateUserTokenPublicKey
    ) {
      intermediateUserTokenPublicKey = await setupTransactionBuilder.createAssociatedTokenAccount(
        walletPublicKey,
        tokenConfigs[intermediateTokenName].mint,
        programIds.token,
      );
    }

    if (this.outputTokenName !== 'SOL' && !outputUserTokenPublicKey) {
      outputUserTokenPublicKey = await setupTransactionBuilder.createAssociatedTokenAccount(
        walletPublicKey,
        tokenConfigs[this.outputTokenName].mint,
        programIds.token,
      );
    }

    const swapTransactionBuilder = new TransactionBuilder();

    const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    );

    const doubleHopFields = this.derivedFields.doubleHopFields;
    if (!doubleHopFields) {
      const pool = this.pools[this.derivedFields.selectedRoute[0]];

      await pool.constructExchange(
        walletPublicKey,
        programIds,
        this.inputTokenName,
        this.outputTokenName,
        this.getInputAmount(),
        this.derivedFields.minimumOutputAmount,
        accountRentExempt,
        swapTransactionBuilder,
        this.inputTokenName === 'SOL' ? undefined : inputUserTokenPublicKey,
        outputUserTokenPublicKey,
      );

      // outputUserTokenPublicKey = result.outputUserTokenPublicKey;
    } else {
      const pool0 = this.pools[this.derivedFields.selectedRoute[0]];

      const result0 = await pool0.constructExchange(
        walletPublicKey,
        programIds,
        this.inputTokenName,
        doubleHopFields.intermediateTokenName,
        this.getInputAmount(),
        doubleHopFields.minimumIntermediateOutputAmount,
        accountRentExempt,
        swapTransactionBuilder,
        this.inputTokenName === 'SOL' ? undefined : inputUserTokenPublicKey,
        intermediateUserTokenPublicKey,
      );

      intermediateUserTokenPublicKey = result0.outputUserTokenPublicKey;

      const pool1 = this.pools[this.derivedFields.selectedRoute[1]];
      await pool1.constructExchange(
        walletPublicKey,
        programIds,
        doubleHopFields.intermediateTokenName,
        this.outputTokenName,
        doubleHopFields.intermediateOutputAmount,
        this.derivedFields.minimumOutputAmount,
        accountRentExempt,
        swapTransactionBuilder,
        intermediateUserTokenPublicKey,
        outputUserTokenPublicKey,
      );

      // outputUserTokenPublicKey = result1.outputUserTokenPublicKey;
    }

    let setupTransaction = undefined;
    if (setupTransactionBuilder.instructions.length) {
      setupTransaction = await setupTransactionBuilder.build(connection, walletPublicKey);
    }

    const swapTransaction = await swapTransactionBuilder.build(connection, walletPublicKey);

    return {
      setupTransaction,
      swapTransaction,
    };
  }

  prepareExchangeTransactionsArgs = async (
    connection: Connection,
    tokenConfigs: TokenConfigs,
    programIds: ProgramIds,
    walletPublicKey: PublicKey,
    inputUserTokenPublicKey: PublicKey,
    intermediateUserTokenPublicKey: PublicKey | undefined,
    outputUserTokenPublicKey: PublicKey | undefined,
  ) => {
    if (!this.pools || !this.derivedFields) {
      throw new Error('Can not initiate an exchange before retrieving the loader');
    }

    let setupSwapArgs;

    const intermediateTokenName = this.getIntermediateTokenName();
    if (
      intermediateTokenName &&
      intermediateTokenName !== 'SOL' &&
      !intermediateUserTokenPublicKey
    ) {
      const intermediateUserTokenAta = await deriveAssociatedTokenAddress(
        walletPublicKey,
        tokenConfigs[intermediateTokenName].mint,
      );

      setupSwapArgs = {
        type: 'intermediateToken',
        associatedTokenAddress: intermediateUserTokenAta,
        mint: tokenConfigs[intermediateTokenName].mint,
        owner: walletPublicKey,
      };

      intermediateUserTokenPublicKey = intermediateUserTokenAta;
    }

    if (this.outputTokenName !== 'SOL' && !outputUserTokenPublicKey) {
      const outputUserTokenAta = await deriveAssociatedTokenAddress(
        walletPublicKey,
        tokenConfigs[this.outputTokenName].mint,
      );

      setupSwapArgs = {
        type: 'outputUserToken',
        associatedTokenAddress: outputUserTokenAta,
        mint: tokenConfigs[this.outputTokenName].mint,
        owner: walletPublicKey,
      };
      outputUserTokenPublicKey = outputUserTokenAta;
    }

    const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    );

    let userSwapArgs;

    const doubleHopFields = this.derivedFields.doubleHopFields;
    if (!doubleHopFields) {
      const pool = this.pools[this.derivedFields.selectedRoute[0]];

      const exchangeData = pool.constructExchangeParams(
        walletPublicKey,
        programIds,
        this.inputTokenName,
        this.outputTokenName,
        this.getInputAmount(),
        this.derivedFields.minimumOutputAmount,
        accountRentExempt,
        this.inputTokenName === 'SOL' ? undefined : inputUserTokenPublicKey,
        outputUserTokenPublicKey,
      );

      userSwapArgs = {
        type: 'direct',
        exchangeData: exchangeData,
        amount: this.getInputAmount(),
        userSourceTokenAccount: inputUserTokenPublicKey,
        userDestinationTokenAccount: outputUserTokenPublicKey,
      };
    } else {
      const pool0 = this.pools[this.derivedFields.selectedRoute[0]];

      const exchangeData1 = pool0.constructExchangeParams(
        walletPublicKey,
        programIds,
        this.inputTokenName,
        doubleHopFields.intermediateTokenName,
        this.getInputAmount(),
        doubleHopFields.minimumIntermediateOutputAmount,
        accountRentExempt,
        this.inputTokenName === 'SOL' ? undefined : inputUserTokenPublicKey,
        intermediateUserTokenPublicKey,
      );

      const pool1 = this.pools[this.derivedFields.selectedRoute[1]];
      const exchangeData2 = pool1.constructExchangeParams(
        walletPublicKey,
        programIds,
        doubleHopFields.intermediateTokenName,
        this.outputTokenName,
        doubleHopFields.intermediateOutputAmount,
        this.derivedFields.minimumOutputAmount,
        accountRentExempt,
        intermediateUserTokenPublicKey,
        outputUserTokenPublicKey,
      );

      userSwapArgs = {
        type: 'transitive',
        exchangeData: {
          swapParams: {
            from: exchangeData1.swapParams,
            to: exchangeData2.swapParams,
            intermediateTokenAccount: intermediateUserTokenPublicKey,
          },
          wsolAccountParams: exchangeData1.wsolAccountParams || exchangeData2.wsolAccountParams,
        },
        amount: this.getInputAmount(),
        userSourceTokenAccount: inputUserTokenPublicKey,
        userDestinationTokenAccount: outputUserTokenPublicKey,
      };
    }

    return { userSwapArgs, setupSwapArgs };
  };

  async confirmExchange(
    connection: Connection,
    tokenConfigs: TokenConfigs,
    programIds: ProgramIds,
    wallet: ConnectedWallet,
    inputUserTokenPublicKey: PublicKey,
    intermediateUserTokenPublicKey: PublicKey | undefined,
    outputUserTokenPublicKey: PublicKey | undefined,
  ): Promise<{
    txSignatureSetup: string | undefined;
    executeSetup: (() => Promise<null>) | undefined;
    txSignatureSwap: string;
    executeSwap: () => Promise<null>;
  }> {
    const { setupTransaction, swapTransaction } = await this.prepareExchangeTransactions(
      connection,
      tokenConfigs,
      programIds,
      wallet.publicKey,
      inputUserTokenPublicKey,
      intermediateUserTokenPublicKey,
      outputUserTokenPublicKey,
    );

    const txs: Transaction[] = [];
    if (setupTransaction) {
      txs.push(setupTransaction);
    }
    txs.push(swapTransaction);

    const signedTxs = await wallet.signAllTransactions(txs);

    let signedSetupTx, signedSwapTx;
    if (signedTxs.length === 2) {
      [signedSetupTx, signedSwapTx] = signedTxs;
    } else {
      [signedSwapTx] = signedTxs;
    }

    return {
      txSignatureSetup: signedSetupTx ? getSignature(signedSetupTx) : undefined,
      executeSetup: signedSetupTx ? sendAndConfirm(connection, signedSetupTx) : undefined,
      txSignatureSwap: getSignature(signedSwapTx),
      executeSwap: sendAndConfirmFast(connection, signedSwapTx),
    };
  }
}

function getBaseOutputAmount(
  route: Route,
  pools: TradeablePoolsMap,
  inputAmount: u64,
  inputTokenName: string,
) {
  const pool0 = pools[route[0]];
  const outputAmount = pool0.getBaseOutputAmount(inputAmount, inputTokenName);

  if (route.length === 1) {
    return outputAmount;
  }

  const intermediateInputTokenName =
    pool0.getTokenAName() === inputTokenName ? pool0.getTokenBName() : pool0.getTokenAName();

  const pool1 = pools[route[1]];

  return pool1.getBaseOutputAmount(outputAmount, intermediateInputTokenName);
}

function getMinimumOutputAmount(
  route: Route,
  pools: TradeablePoolsMap,
  inputAmount: u64,
  inputTokenName: string,
  slippageTolerance: SlippageTolerance,
) {
  const pool0 = pools[route[0]];
  const minimumOutputAmount = pool0.getMinimumAmountOut(
    inputAmount,
    inputTokenName,
    slippageTolerance,
  );

  if (route.length === 1) {
    return minimumOutputAmount;
  }

  const intermediateInputTokenName =
    pool0.getTokenAName() === inputTokenName ? pool0.getTokenBName() : pool0.getTokenAName();
  const intermediateInputAmount = pool0.getOutputAmount(inputAmount, inputTokenName);

  const pool1 = pools[route[1]];

  return pool1.getMinimumAmountOut(
    intermediateInputAmount,
    intermediateInputTokenName,
    slippageTolerance,
  );
}

function getDoubleHopFields(
  route: Route,
  pools: TradeablePoolsMap,
  inputAmount: u64,
  inputTokenName: string,
  slippageTolerance: SlippageTolerance,
): DoubleHopFields | null {
  if (route.length === 1) {
    return null;
  }

  const pool0 = pools[route[0]];

  return {
    intermediateTokenName:
      pool0.getTokenAName() === inputTokenName ? pool0.getTokenBName() : pool0.getTokenAName(),
    intermediateOutputAmount: pool0.getOutputAmount(inputAmount, inputTokenName),
    minimumIntermediateOutputAmount: pool0.getMinimumAmountOut(
      inputAmount,
      inputTokenName,
      slippageTolerance,
    ),
  };
}

type RouteExecutionFromInput = {
  route: Route;
  outputAmount: u64;
};

function getRouteExecutionFromInput(
  route: Route,
  pools: TradeablePoolsMap,
  inputAmount: u64,
  inputTokenName: string,
): RouteExecutionFromInput {
  const pool0 = pools[route[0]];
  const outputAmount = pool0.getOutputAmount(inputAmount, inputTokenName);

  if (route.length === 1) {
    return {
      route,
      outputAmount,
    };
  }

  const pool1 = pools[route[1]];

  const intermediateTokenName =
    pool0.getTokenAName() === inputTokenName ? pool0.getTokenBName() : pool0.getTokenAName();

  return {
    route,
    outputAmount: pool1.getOutputAmount(outputAmount, intermediateTokenName),
  };
}

function selectRouteFromInput(
  routes: Route[],
  pools: TradeablePoolsMap,
  inputAmount: u64,
  inputTokenName: string,
): RouteExecutionFromInput {
  const init: RouteExecutionFromInput = {
    route: routes[0],
    outputAmount: ZERO,
  };

  return routes.reduce((bestRoute, route) => {
    const routeExecution = getRouteExecutionFromInput(route, pools, inputAmount, inputTokenName);

    return bestRoute.outputAmount.lt(routeExecution.outputAmount) ? routeExecution : bestRoute;
  }, init);
}

function orderRoutes(pools: TradeablePoolsMap, routes: Route[], inputTokenName: string): Route[] {
  return routes.map((route) => {
    if (route.length === 1) {
      return route;
    }

    const route0Pool = pools[route[0]];
    if (
      route0Pool.getTokenAName() === inputTokenName ||
      route0Pool.getTokenBName() === inputTokenName
    ) {
      return route;
    }

    return route.slice().reverse();
  });
}

type RouteExecutionFromOutput = {
  route: Route;
  inputAmount: u64;
};

function getRouteExecutionFromOutput(
  route: Route,
  pools: TradeablePoolsMap,
  outputTokenName: string,
  outputAmount: u64,
): RouteExecutionFromOutput {
  const route0 = route[route.length - 1];
  const pool0 = pools[route0];

  const intermediateTokenName =
    pool0.getTokenAName() === outputTokenName ? pool0.getTokenBName() : pool0.getTokenAName();

  const intermediateAmount = pool0.getInputAmount(outputAmount, outputTokenName);

  if (route.length === 1) {
    return {
      route,
      inputAmount: intermediateAmount,
    };
  }

  const pool1 = pools[route[0]];

  const inputAmount = pool1.getInputAmount(intermediateAmount, intermediateTokenName);

  return {
    route,
    inputAmount,
  };
}

function selectRouteFromOutput(
  routes: Route[],
  pools: TradeablePoolsMap,
  outputTokenName: string,
  outputAmount: u64,
): RouteExecutionFromOutput {
  const init: RouteExecutionFromOutput = {
    route: routes[0],
    inputAmount: ZERO,
  };

  return routes.reduce((bestRoute, route) => {
    let routeExecution;
    try {
      routeExecution = getRouteExecutionFromOutput(route, pools, outputTokenName, outputAmount);
    } catch (e) {
      if (e instanceof OutputTooHighError) {
        return bestRoute;
      }
      throw e;
    }

    // Otherwise, choose the route with a lower inputAmount
    return bestRoute.inputAmount.eq(ZERO) || bestRoute.inputAmount.gt(routeExecution.inputAmount)
      ? routeExecution
      : bestRoute;
  }, init);
}

function deriveTrade(parameters: TradeParameters): Trade {
  if (
    !parameters.routes.length ||
    !parameters.pools ||
    !Object.keys(parameters.pools).length ||
    parameters.amount.eq(ZERO)
  ) {
    return new Trade({
      ...parameters,
      derivedFields: undefined,
    });
  }

  const pools = parameters.pools;

  // Reverse order of routes if user is trading in the other direction
  const routes = orderRoutes(pools, parameters.routes, parameters.inputTokenName);

  let route: Route, inputAmount: u64, outputAmount: u64, otherAmount: u64;
  if (parameters.isInputAmount) {
    ({ route, outputAmount: otherAmount } = selectRouteFromInput(
      routes,
      pools,
      parameters.amount,
      parameters.inputTokenName,
    ));

    inputAmount = parameters.amount;
    outputAmount = otherAmount;
  } else {
    ({ route, inputAmount: otherAmount } = selectRouteFromOutput(
      routes,
      pools,
      parameters.outputTokenName,
      parameters.amount,
    ));

    if (otherAmount === ZERO) {
      return new Trade({
        ...parameters,
        outputTooHigh: true,
        derivedFields: undefined,
      });
    }

    outputAmount = parameters.amount;
    inputAmount = otherAmount;
  }

  const minimumOutputAmount = getMinimumOutputAmount(
    route,
    pools,
    inputAmount,
    parameters.inputTokenName,
    parameters.slippageTolerance,
  );

  const inputDecimal = new BigDecimal(inputAmount.toString()).div(
    new BigDecimal(10).pow(parameters.tokenConfigs[parameters.inputTokenName].decimals),
  );
  const outputDecimal = new BigDecimal(outputAmount.toString()).div(
    new BigDecimal(10).pow(parameters.tokenConfigs[parameters.outputTokenName].decimals),
  );
  const exchangeRate = outputDecimal.dividedBy(inputDecimal);

  const baseOutputAmount = getBaseOutputAmount(
    route,
    pools,
    inputAmount,
    parameters.inputTokenName,
  );
  const baseOutputDecimal = new BigDecimal(baseOutputAmount.toString());
  const priceImpact = baseOutputDecimal
    .minus(outputAmount.toString())
    .dividedBy(baseOutputDecimal)
    .mul(new BigDecimal(100));

  const doubleHopFields = getDoubleHopFields(
    route,
    pools,
    inputAmount,
    parameters.inputTokenName,
    parameters.slippageTolerance,
  );
  // TODO: Check that this is correct
  const fees = route.map((route, idx) => {
    const pool = pools[route];
    if (idx === 0) {
      return pool.calculateFees(inputAmount, parameters.inputTokenName);
    } else if (doubleHopFields) {
      return pool.calculateFees(
        doubleHopFields.intermediateOutputAmount,
        doubleHopFields.intermediateTokenName,
      );
    }

    throw new Error('double hop fields not found');
  });

  return new Trade({
    ...parameters,
    outputTooHigh: false,
    derivedFields: {
      otherAmount,
      selectedRoute: route,
      minimumOutputAmount,
      baseOutputAmount,
      exchangeRate,
      priceImpact,
      fees,
      doubleHopFields,
    },
  });
}
