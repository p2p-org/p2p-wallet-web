import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { getTransaction } from 'features/transaction/TransactionSlice';
import { RootState } from 'store/rootReducer';
import { useTokenInfo } from 'utils/hooks/useTokenInfo';

export const useTransactionInfo = (signature: string) => {
  const dispatch = useDispatch();
  const transaction = useSelector((state: RootState) => state.transaction.items[signature]);

  const instruction = transaction?.transaction.message.instructions[0];

  const { source } = instruction?.parsed?.info || {};
  const { symbol, decimals } = useTokenInfo(source);

  useEffect(() => {
    dispatch(getTransaction(signature));
  }, [signature]);

  let amount = 0;
  if (decimals) {
    if (instruction?.programId.equals(TOKEN_PROGRAM_ID)) {
      amount = Number.parseFloat(instruction?.parsed?.info.amount || 0);
    } else if (instruction?.programId.equals(SYSTEM_PROGRAM_ID)) {
      amount = Number.parseFloat(instruction?.parsed?.info.lamports || 0);
    }
    amount /= 10 ** decimals;
  }

  return {
    slot: transaction?.slot,
    type: instruction?.parsed?.type,
    source,
    symbol,
    amount,
    meta: transaction?.meta,
  };
};
