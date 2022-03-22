import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { createContainer } from 'unstated-next';

import type {
  BuyCurrencySelectType,
  MoonpayErrorResponse,
  MoonpayGetBuyQuoteResponse,
} from 'app/contexts';
import { BUY_CURRENCIES_SELECT, MoonpayErrorResponseType, useMoonpay } from 'app/contexts';

export interface UseBuyState {
  isShowIframe: boolean;
  setIsShowIframe: (nextIsShowIframe: boolean) => void;

  currency: BuyCurrencySelectType;
  setCurrency: (nextCurrency: BuyCurrencySelectType) => void;

  amount: string;
  setAmount: (nextAmount: string) => void;
  isBaseAmountType: boolean;
  changeAmountType: () => void;

  error: string;
  buyQuote: null | MoonpayGetBuyQuoteResponse;

  isLoading: boolean;
}

const useBuyStateInternal = (): UseBuyState => {
  const { symbol } = useParams<{ symbol?: string }>();
  const { getBuyQuote } = useMoonpay();

  const [isShowIframe, setIsShowIframe] = useState(false);
  const [currency, setCurrency] = useState<BuyCurrencySelectType>(BUY_CURRENCIES_SELECT.SOL!);
  const [amount, setAmount] = useState('');
  const [isBaseAmountType, setIsBaseAmountType] = useState(true);
  const [error, setError] = useState('');
  const [buyQuote, setBuyQuote] = useState<null | MoonpayGetBuyQuoteResponse>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Symbol from url initial or changed
  useEffect(() => {
    if (symbol && BUY_CURRENCIES_SELECT[symbol]) {
      setCurrency(BUY_CURRENCIES_SELECT[symbol]!);
    }
  }, [symbol]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      try {
        setError('');
        const result = await getBuyQuote(amount, isBaseAmountType, currency.currencyCode, controller);

        if ((result as MoonpayErrorResponse).type === MoonpayErrorResponseType.BadRequestError) {
          setError((result as MoonpayErrorResponse).message);
          setBuyQuote(null);
          return;
        }

        setBuyQuote(result as MoonpayGetBuyQuoteResponse);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [amount, isBaseAmountType, currency.currencyCode, getBuyQuote]);

  const changeAmountType = () => {
    if (isBaseAmountType) {
      setAmount(buyQuote?.quoteCurrencyAmount || 0);
    } else {
      setAmount(buyQuote?.baseCurrencyAmount || 0);
    }

    setIsBaseAmountType(!isBaseAmountType);
  };

  return {
    isShowIframe,
    setIsShowIframe,
    currency,
    setCurrency,
    amount,
    setAmount,
    isBaseAmountType,
    changeAmountType,
    error,
    buyQuote,
    isLoading,
  };
};

export const { Provider: BuyStateProvider, useContainer: useBuyState } =
  createContainer(useBuyStateInternal);
