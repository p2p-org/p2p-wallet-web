import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import classNames from 'classnames';
import Decimal from 'decimal.js';

import { useSendState, useSettings } from 'app/contexts';
import { Icon, TextField, Tooltip } from 'components/ui';

const InfoIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  margin-left: 10px;

  color: #a3a5ba;
`;

const TextFieldTXStyled = styled(TextField)`
  &.isFree {
    color: #2db533;
  }
`;

const TooltipRow = styled.div`
  display: flex;

  font-size: 14px;
`;

const TxName = styled.div`
  flex-grow: 1;

  margin-right: 5px;

  font-weight: normal;
`;

const TxValue = styled.div`
  font-weight: 600;
`;

const BURN_ALLOCATE_ACCOUNT_SIZE = 97;

const formatFee = (amount: number): number =>
  new Decimal(amount)
    .div(10 ** 9)
    .toDecimalPlaces(9)
    .toNumber();

export const TransferFee: FC = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const { fromTokenAccount, blockchain } = useSendState();
  const { connection } = useWallet();

  const [txFee, setTxFee] = useState(0);
  const [rentFee, setRentFee] = useState(0);

  const isNetworkSourceSelectorVisible = fromTokenAccount?.balance?.token.symbol === 'renBTC';

  useEffect(() => {
    const mount = async () => {
      try {
        const resultRentFee = await connection.getMinimumBalanceForRentExemption(
          BURN_ALLOCATE_ACCOUNT_SIZE,
        );
        const resultRecentBlockhash = await connection.getRecentBlockhash();

        setRentFee(formatFee(resultRentFee));
        setTxFee(formatFee(resultRecentBlockhash.feeCalculator.lamportsPerSignature));
      } catch (error) {
        console.log(error);
      }
    };

    if (!useFreeTransactions || isNetworkSourceSelectorVisible) {
      void mount();
    }
  }, [useFreeTransactions, isNetworkSourceSelectorVisible, connection]);

  const toolTipItems = useMemo(() => {
    const _toolTipItems = [];

    if (useFreeTransactions && !isNetworkSourceSelectorVisible) {
      _toolTipItems.push(
        <TooltipRow key="tooltip-row-1">Paid by p2p.org.</TooltipRow>,
        <TooltipRow key="tooltip-row-2">We take care of all transfers costs ✌.</TooltipRow>,
      );
    } else {
      _toolTipItems.push(
        <TooltipRow key="tooltip-row-3">
          <TxName>Transaction:</TxName>
          <TxValue>{`${txFee} SOL`}</TxValue>
        </TooltipRow>,
      );

      if (blockchain === 'bitcoin') {
        _toolTipItems.push(
          <TooltipRow key="tooltip-row-4">
            <TxName>Fee:</TxName>
            <TxValue>{`${rentFee} SOL`}</TxValue>
          </TooltipRow>,
        );
      }
    }

    return _toolTipItems;
  }, [blockchain, isNetworkSourceSelectorVisible, rentFee, txFee, useFreeTransactions]);

  return (
    <TextFieldTXStyled
      label="Transfer fee"
      value={blockchain === 'solana' ? 'Free' : `${txFee + rentFee} SOL`}
      icon={<Tooltip title={<InfoIcon name="info" />}>{toolTipItems}</Tooltip>}
      className={classNames({ isFree: blockchain === 'solana' })}
    />
  );
};
