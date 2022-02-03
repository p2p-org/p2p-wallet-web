import { useEffect, useState } from 'react';

import { createContainer } from 'unstated-next';

import type { MoonpayErrorResponse, MoonpayGetBuyQuoteResponse } from 'app/contexts';
import { MoonpayErrorResponseType, useMoonpay } from 'app/contexts';

export interface UseBuyState {
  isShowIframe: boolean;
  setIsShowIframe: (nextIsShowIframe: boolean) => void;

  amount: string;
  setAmount: (nextAmount: string) => void;

  error: string;
  buyQuote: null | MoonpayGetBuyQuoteResponse;

  isLoading: boolean;
}

const useBuyStateInternal = (): UseBuyState => {
  const { getBuyQuote } = useMoonpay();

  const [isShowIframe, setIsShowIframe] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [buyQuote, setBuyQuote] = useState<null | MoonpayGetBuyQuoteResponse>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      try {
        setError('');
        const result = await getBuyQuote(amount, controller);

        if ((result as MoonpayErrorResponse).type === MoonpayErrorResponseType.BadRequestError) {
          setError((result as MoonpayErrorResponse).message);
          setBuyQuote(null);
          return;
        }

        setBuyQuote(result as MoonpayGetBuyQuoteResponse);
      } catch (err) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [amount, getBuyQuote]);

  return {
    isShowIframe,
    setIsShowIframe,
    amount,
    setAmount,
    error,
    buyQuote,
    isLoading,
  };
};

export const { Provider: BuyStateProvider, useContainer: useBuyState } =
  createContainer(useBuyStateInternal);
