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
}

const useBuyStateInternal = (): UseBuyState => {
  const { getBuyQuote } = useMoonpay();

  const [isShowIframe, setIsShowIframe] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [buyQuote, setBuyQuote] = useState<null | MoonpayGetBuyQuoteResponse>(null);

  useEffect(() => {
    void (async () => {
      const result = await getBuyQuote(amount);

      if ((result as MoonpayErrorResponse).type === MoonpayErrorResponseType.BadRequestError) {
        setError((result as MoonpayErrorResponse).message);
        setBuyQuote(null);
        return;
      }

      setError('');
      setBuyQuote(result as MoonpayGetBuyQuoteResponse);
    })();
  }, [amount, getBuyQuote]);

  return {
    isShowIframe,
    setIsShowIframe,
    amount,
    setAmount,
    error,
    buyQuote,
  };
};

export const { Provider: BuyStateProvider, useContainer: useBuyState } =
  createContainer(useBuyStateInternal);
