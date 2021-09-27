import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { Bitcoin } from '@renproject/chains-bitcoin';
import { RenNetwork } from '@renproject/interfaces';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { RateUSD } from 'components/common/RateUSD';
import { FromToSelectInput } from 'components/common/SendSwapWidget/common/FromToSelectInput';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon, Switch, Tooltip } from 'components/ui';
import { Select, TextField } from 'components/ui';
import { MenuItem } from 'components/ui/Select/MenuItem';
import { openModal } from 'store/actions/modals';
import {
  SHOW_MODAL_ERROR,
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import {
  getMinimumBalanceForRentExemption,
  getRecentBlockhash,
  getTokenAccount,
  transfer,
} from 'store/slices/wallet/WalletSlice';
import { minorAmountToMajor } from 'utils/amount';
import { trackEvent } from 'utils/analytics';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

import { Hint } from '../../Hint';
import {
  BottomWrapper,
  ButtonWrapper,
  FromWrapper,
  TooltipRow,
  TxName,
  TxValue,
  WrapperWidgetPage,
} from '../common/styled';
import { BurnAndRelease } from './BurnAndRelease';
import { ToAddressInput } from './ToAddressInput';

const Wrapper = styled.div`
  margin-top: 16px;
  padding: 8px 20px;
`;

const ToSendWrapper = styled(FromWrapper)``;

const FromTitle = styled.div`
  margin-bottom: 8px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const InfoIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  margin-left: 10px;

  color: #a3a5ba;
`;

const ConfirmWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 20px 0 0;

  &.isShowConfirmAddressSwitch {
    border-top: 1px solid #f6f6f8;
  }
`;

const ConfirmTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ConfirmTextPrimary = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
`;
const ConfirmTextSecondary = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const HintWrapper = styled.div`
  padding: 12px 0;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const Error = styled.div`
  margin-left: 66px;

  color: #f43d3d;
  font-weight: 600;
  font-size: 16px;
`;

const TextFieldTXStyled = styled(TextField)`
  margin-bottom: 8px;

  &.isFree {
    color: #2db533;
  }
`;

const TextFieldStyled = styled(TextField)`
  margin-bottom: 8px;
`;

const NetworkSelectWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 8px;
  padding: 12px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

const NetworkSelectText = styled.div`
  display: flex;
  flex-grow: 1;

  font-weight: 600;
  font-size: 16px;
`;

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const SOURCE_NETWORKS = ['solana', 'bitcoin'];
const BURN_ALLOCATE_ACCOUNT_SIZE = 97;

type Props = {
  publicKey: string | null;
};

const isValidAmount = (amount: string): boolean => {
  const amountValue = Number.parseFloat(amount);

  return amount === '' || amountValue === 0;
};

const isValidAddress = (
  isSolanaNetwork: boolean,
  address: string,
  network: RenNetwork,
): boolean => {
  if (isSolanaNetwork) {
    try {
      // eslint-disable-next-line no-new
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  return Bitcoin.utils.addressIsValid(address, network);
};

const formatFee = (amount: number): number =>
  new Decimal(amount)
    .div(10 ** 9)
    .toDecimalPlaces(9)
    .toNumber();

export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEventOnce = useTrackEventOnce();
  const [fromAmount, setFromAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const [txFee, setTxFee] = useState(0);
  const [rentFee, setRentFee] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isShowConfirmAddressSwitch, setIsShowConfirmAddressSwitch] = useState(false);
  const [isConfirmCorrectAddress, setIsConfirmCorrectAddress] = useState(false);
  const [destinationNetwork, setDestinationNetwork] = useState(SOURCE_NETWORKS[0]);
  const [isInitBurnAndRelease, setIsInitBurnAndRelease] = useState(false);

  const network = useRenNetwork();
  const isSolanaNetwork = destinationNetwork === 'solana';

  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const fromTokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [tokenAccounts, publicKey],
  );

  const useFreeTransactions = useSelector(
    (state: RootState) => state.wallet.settings.useFreeTransactions,
  );
  const isNetworkSourceSelectorVisible = fromTokenAccount?.mint.symbol === 'renBTC';

  useEffect(() => {
    const mount = async () => {
      try {
        const resultRentFee = unwrapResult(
          await dispatch(getMinimumBalanceForRentExemption(BURN_ALLOCATE_ACCOUNT_SIZE)),
        );

        const resultRecentBlockhash = unwrapResult(await dispatch(getRecentBlockhash()));

        setRentFee(formatFee(resultRentFee));
        setTxFee(formatFee(resultRecentBlockhash.feeCalculator.lamportsPerSignature));
      } catch (error) {
        console.log(error);
      }
    };

    if (!useFreeTransactions || isNetworkSourceSelectorVisible) {
      void mount();
    }
  }, [dispatch, useFreeTransactions, isNetworkSourceSelectorVisible]);

  useEffect(() => {
    const checkDestinationAddress = async () => {
      const account = unwrapResult(
        await dispatch(getTokenAccount(new PublicKey(toTokenPublicKey))),
      );

      if (!account) {
        setIsShowConfirmAddressSwitch(true);
      }
    };

    if (isSolanaNetwork && isValidAddress(isSolanaNetwork, toTokenPublicKey, network)) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [dispatch, isSolanaNetwork, network, toTokenPublicKey]);

  const handleSubmit = async () => {
    if (!isSolanaNetwork) {
      const result = unwrapResult(
        await dispatch(
          openModal({
            modalType: SHOW_MODAL_TRANSACTION_CONFIRM,
            props: {
              type: 'send',
              params: {
                source: fromTokenAccount,
                destination: toTokenPublicKey,
                amount: fromAmount,
              },
            },
          }),
        ),
      );

      if (!result) {
        return false;
      }

      setIsInitBurnAndRelease(true);

      return;
    }

    if (!fromTokenAccount) {
      throw new Error("Didn't find token");
    }

    const amount = new Decimal(fromAmount).mul(10 ** fromTokenAccount?.mint.decimals).toNumber();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const destination = new PublicKey(toTokenPublicKey);

    if (fromTokenAccount?.mint.symbol !== 'SOL') {
      const account = unwrapResult(await dispatch(getTokenAccount(destination)));

      if (
        account &&
        account.mint.symbol !== 'SOL' &&
        !account.mint.address.equals(fromTokenAccount.mint.address)
      ) {
        void dispatch(
          openModal({
            modalType: SHOW_MODAL_ERROR,
            props: {
              icon: 'wallet',
              header: 'Wallet address is not valid',
              text: `The wallet address is not valid. It must be a ${fromTokenAccount.mint.symbol} wallet address`,
            },
          }),
        );
        return;
      }
    }

    const result = unwrapResult(
      await dispatch(
        openModal({
          modalType: SHOW_MODAL_TRANSACTION_CONFIRM,
          props: {
            type: 'send',
            params: {
              source: fromTokenAccount,
              destination: destination.toBase58(),
              amount: fromAmount,
            },
          },
        }),
      ),
    );

    if (!result) {
      return false;
    }

    try {
      setIsExecuting(true);

      const action = transfer({
        source: fromTokenAccount.address,
        destination,
        amount,
      });

      trackEvent('send_send_click', {
        tokenTicker: fromTokenAccount.mint.symbol || '',
        sum: amount,
      });

      unwrapResult(
        await dispatch(
          openModal({
            modalType: SHOW_MODAL_TRANSACTION_STATUS,
            props: {
              type: 'send',
              action,
              fromToken: fromTokenAccount.mint,
              fromAmount: new Decimal(amount),
            },
          }),
        ),
      );
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFromTokenAccountChange = (
    nextToken: Token,
    nextTokenAccount: TokenAccount | null,
  ) => {
    if (!nextTokenAccount) {
      return;
    }

    trackEvent('send_select_token_click', { tokenTicker: nextTokenAccount.mint.symbol || '' });

    history.replace(`/send/${nextTokenAccount.address.toBase58()}`);
  };

  const handleFromAmountChange = (minorAmount: string, type?: string) => {
    setFromAmount(minorAmount);

    if (type === 'available') {
      trackEvent('send_available_click', { sum: Number(minorAmount) });
    } else {
      trackEvent('send_amount_keydown', { sum: Number(minorAmount) });
    }
  };

  const handleToPublicKeyChange = (nextPublicKey: string) => {
    setToTokenPublicKey(nextPublicKey);

    trackEventOnce('send_address_keydown');
  };

  const hasBalance = fromTokenAccount
    ? minorAmountToMajor(fromTokenAccount.balance, fromTokenAccount.mint).toNumber() >=
      Number(fromAmount)
    : false;

  const isDisabled = isExecuting;
  const isValidDestinationAddress = isValidAddress(isSolanaNetwork, toTokenPublicKey, network);
  const toolTipItems = [];
  if (useFreeTransactions && !isNetworkSourceSelectorVisible) {
    toolTipItems.push(
      <TooltipRow key="tooltip-row-1">Paid by p2p.org.</TooltipRow>,
      <TooltipRow key="tooltip-row-2">We take care of all transfers costs ✌.</TooltipRow>,
    );
  } else {
    toolTipItems.push(
      <TooltipRow key="tooltip-row-3">
        <TxName>Transaction:</TxName>
        <TxValue>{`${txFee} SOL`}</TxValue>
      </TooltipRow>,
    );

    if (!isSolanaNetwork) {
      toolTipItems.push(
        <TooltipRow key="tooltip-row-4">
          <TxName>Fee:</TxName>
          <TxValue>{`${rentFee} SOL`}</TxValue>
        </TooltipRow>,
      );
    }
  }

  return (
    <div>
      <WrapperWidgetPage title="Send" icon="top">
        <Wrapper>
          <FromWrapper>
            <FromToSelectInput
              tokenAccounts={tokenAccounts}
              token={fromTokenAccount?.mint}
              tokenAccount={fromTokenAccount}
              amount={fromAmount}
              onTokenAccountChange={handleFromTokenAccountChange}
              onAmountChange={handleFromAmountChange}
              disabled={isDisabled}
            />
          </FromWrapper>
          <ToSendWrapper>
            <FromTitle>To</FromTitle>
            <ToAddressInput value={toTokenPublicKey || ''} onChange={handleToPublicKeyChange} />
            {toTokenPublicKey.length > 0 && !isValidDestinationAddress ? (
              <Error>Check recepient address</Error>
            ) : undefined}
            {isShowConfirmAddressSwitch ? (
              <ConfirmWrapper className={classNames({ isShowConfirmAddressSwitch })}>
                <ConfirmTextWrapper>
                  <ConfirmTextPrimary>
                    Is this address correct? It doesn’t have funds.
                  </ConfirmTextPrimary>
                  <ConfirmTextSecondary>I’m sure, It’s correct</ConfirmTextSecondary>
                </ConfirmTextWrapper>
                <Switch
                  checked={isConfirmCorrectAddress}
                  onChange={() => setIsConfirmCorrectAddress(!isConfirmCorrectAddress)}
                />
              </ConfirmWrapper>
            ) : undefined}
          </ToSendWrapper>
          {isNetworkSourceSelectorVisible ? (
            <NetworkSelectWrapper>
              <NetworkSelectText>Network</NetworkSelectText>
              <Select value={destinationNetwork}>
                {SOURCE_NETWORKS.map((network) => (
                  <MenuItem
                    key={network}
                    isSelected={network === destinationNetwork}
                    onItemClick={() => setDestinationNetwork(network)}>
                    {network}
                  </MenuItem>
                ))}
              </Select>
            </NetworkSelectWrapper>
          ) : undefined}
          <TextFieldStyled
            label="Current price"
            value={
              <>
                <RateUSD symbol={fromTokenAccount?.mint.symbol} />{' '}
                <span>&nbsp;per {fromTokenAccount?.mint.symbol} </span>
              </>
            }
          />
          <TextFieldTXStyled
            label="Transfer fee"
            value={isSolanaNetwork ? 'Free' : `${txFee + rentFee} SOL`}
            icon={<Tooltip title={<InfoIcon name="info" />}>{toolTipItems}</Tooltip>}
            className={classNames({ isFree: isSolanaNetwork })}
          />
          <BottomWrapper>
            <ButtonWrapper>
              <Button
                primary={!isDisabled}
                disabled={
                  isDisabled ||
                  isValidAmount(fromAmount) ||
                  (isSolanaNetwork && !isValidDestinationAddress) ||
                  !hasBalance ||
                  (isShowConfirmAddressSwitch && !isConfirmCorrectAddress)
                }
                big
                full
                onClick={handleSubmit}>
                <SendIcon name="top" />
                Send now
              </Button>
            </ButtonWrapper>
          </BottomWrapper>
          <HintWrapper>Send SOL or any SPL Tokens on one address</HintWrapper>
          {isInitBurnAndRelease ? (
            <BurnAndRelease destinationAddress={toTokenPublicKey} targetAmount={fromAmount} />
          ) : undefined}
        </Wrapper>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
