import type { FunctionComponent } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import type { ResolveUsernameResponse, TokenAccount } from '@p2p-wallet-web/core';
import {
  useNameService,
  useSolana,
  useUserTokenAccount,
  useUserTokenAccounts,
  useWallet,
} from '@p2p-wallet-web/core';
import { unwrapResult } from '@reduxjs/toolkit';
import { Bitcoin } from '@renproject/chains-bitcoin';
import type { RenNetwork } from '@renproject/interfaces';
import type { Token } from '@saberhq/token-utils';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import { rgba } from 'polished';

import { useSettings } from 'app/contexts/settings';
import { RateUSD } from 'components/common/RateUSD';
import { FromToSelectInput } from 'components/pages/send/SendWidget/FromToSelectInput';
import { Button, Icon, Select, Switch, TextField, Tooltip } from 'components/ui';
import { MenuItem } from 'components/ui/Select/MenuItem';
import { openModal } from 'store/actions/modals';
import {
  SHOW_MODAL_ERROR,
  SHOW_MODAL_TRANSACTION_CONFIRM,
  SHOW_MODAL_TRANSACTION_STATUS,
} from 'store/constants/modalTypes';
import { getTokenAccount, transfer } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';
import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';
import { useFetchFees } from 'utils/providers/LockAndMintProvider';

import { Hint } from '../../../common/Hint';
import { BurnAndRelease } from './BurnAndRelease';
import {
  BottomWrapper,
  ButtonWrapper,
  FromWrapper,
  TooltipRow,
  TxName,
  TxValue,
  WrapperWidgetPage,
} from './common/styled';
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

const isValidAmount = (amount: string): boolean => {
  const amountValue = Number.parseFloat(amount);

  return amount === '' || amountValue === 0;
};

const isValidAddress = (
  isSolanaNetwork: boolean,
  address: string,
  network: RenNetwork,
): boolean => {
  if (isSolanaNetwork && address.length >= 40) {
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

const getTransactionFee = (amount: string, fees: any) => {
  const amountNumber = Number(amount);
  const renTxTypeFee = fees.burn;
  const networkFee = Number(fees.release) / 10 ** 8;
  const renVMFee = Number(renTxTypeFee) / 10000; // percent value
  const renVMFeeAmount = Number(amountNumber * renVMFee);
  const total = Number(Number(amountNumber - renVMFeeAmount - networkFee).toFixed(6));
  return total > 0 ? total : 0;
};

type Props = {
  publicKey: string | undefined;
};

// TODO: refactor To field to own component wit logic by hooks
export const SendWidget: FunctionComponent<Props> = ({ publicKey = '' }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEventOnce = useTrackEventOnce();
  const { resolveUsername } = useNameService();
  const { provider } = useSolana();
  const { connection } = useWallet();
  const renNetwork = useRenNetwork();
  const tokenAccounts = useUserTokenAccounts();
  const fromTokenAccount = useUserTokenAccount(publicKey);

  const [fromAmount, setFromAmount] = useState('');
  const [toTokenPublicKey, setToTokenPublicKey] = useState('');
  const [txFee, setTxFee] = useState(0);
  const [rentFee, setRentFee] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isShowConfirmAddressSwitch, setIsShowConfirmAddressSwitch] = useState(false);
  const [isConfirmCorrectAddress, setIsConfirmCorrectAddress] = useState(false);
  const [destinationNetwork, setDestinationNetwork] = useState(SOURCE_NETWORKS[0]);
  const [isInitBurnAndRelease, setIsInitBurnAndRelease] = useState(false);
  const [renBtcMinimalAmount, setRenBtcMinimalAmount] = useState(0);
  const [usernameResolvedAddress, setUsernameResolvedAddress] = useState<string | null>(null);
  const [isSolanaNetwork, setIsSolanaNetwork] = useState(true);
  const [resolvedNames, setResolvedNames] = useState<ResolveUsernameResponse[]>([]);
  const [isResolvingNames, setisResolvingNames] = useState(false);

  const { fees, pending: isFetchingFee } = useFetchFees(!isSolanaNetwork);

  const {
    settings: { useFreeTransactions },
  } = useSettings();
  const isNetworkSourceSelectorVisible = fromTokenAccount?.balance?.token.symbol === 'renBTC';

  useEffect(() => {
    if (destinationNetwork !== 'solana') {
      setIsSolanaNetwork(false);
    } else {
      setIsSolanaNetwork(true);
    }
    if (destinationNetwork !== 'solana' && fromTokenAccount?.balance?.token.symbol !== 'renBTC') {
      setIsSolanaNetwork(true);
    }
  }, [destinationNetwork, fromTokenAccount?.balance?.token.symbol]);

  useEffect(() => {
    async function resolveName() {
      setisResolvingNames(true);
      const resolved = await resolveUsername(toTokenPublicKey);

      setisResolvingNames(false);
      setResolvedNames([]);
      setUsernameResolvedAddress(null);

      if (resolved.length === 1) {
        setUsernameResolvedAddress(resolved[0].owner);
      } else if (resolved.length > 1) {
        setResolvedNames(resolved);
      }
    }

    if (isSolanaNetwork && toTokenPublicKey.length > 0 && toTokenPublicKey.length <= 40) {
      resolveName();
    } else {
      setUsernameResolvedAddress(null);
    }
  }, [dispatch, isSolanaNetwork, toTokenPublicKey]);

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
  }, [dispatch, useFreeTransactions, isNetworkSourceSelectorVisible]);

  useEffect(() => {
    const checkDestinationAddress = async () => {
      const account = await provider.getAccountInfo(new PublicKey(toTokenPublicKey));

      if (!account) {
        setIsShowConfirmAddressSwitch(true);
      }
    };

    if (isSolanaNetwork && isValidAddress(isSolanaNetwork, toTokenPublicKey, renNetwork)) {
      void checkDestinationAddress();
    } else {
      setIsShowConfirmAddressSwitch(false);
    }
  }, [dispatch, isSolanaNetwork, renNetwork, toTokenPublicKey]);

  useEffect(() => {
    if (!isSolanaNetwork && !isFetchingFee) {
      const amount = getTransactionFee(fromAmount, fees);
      setRenBtcMinimalAmount(amount);
    }
  }, [fees, fromAmount, isFetchingFee, isSolanaNetwork]);

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

    if (!fromTokenAccount || !fromTokenAccount.mint || !fromTokenAccount?.balance) {
      throw new Error("Didn't find token");
    }

    const amount = new Decimal(fromAmount)
      .mul(10 ** fromTokenAccount?.balance?.token.decimals)
      .toNumber();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const destination = new PublicKey(
      usernameResolvedAddress ? usernameResolvedAddress : toTokenPublicKey,
    );

    if (fromTokenAccount?.balance.token.symbol !== 'SOL') {
      const account = unwrapResult(await dispatch(getTokenAccount(destination)));

      if (
        account &&
        account.mint.symbol !== 'SOL' &&
        !account.mint.address.equals(fromTokenAccount.mint)
      ) {
        void dispatch(
          openModal({
            modalType: SHOW_MODAL_ERROR,
            props: {
              icon: 'wallet',
              header: 'Wallet address is not valid',
              text: `The wallet address is not valid. It must be a ${fromTokenAccount.balance.token.symbol} wallet address`,
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
              username: usernameResolvedAddress ? toTokenPublicKey : '',
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
        source: fromTokenAccount.key,
        destination,
        amount,
      });

      trackEvent('send_send_click', {
        tokenTicker: fromTokenAccount.balance.token.symbol || '',
        sum: amount,
      });

      unwrapResult(
        await dispatch(
          openModal({
            modalType: SHOW_MODAL_TRANSACTION_STATUS,
            props: {
              type: 'send',
              action,
              params: {
                fromToken: fromTokenAccount.mint,
                fromAmount: new Decimal(amount),
              },
            },
          }),
        ),
      );
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

    trackEvent('send_select_token_click', {
      tokenTicker: nextTokenAccount.balance?.token.symbol || '',
    });

    history.replace(`/send/${nextTokenAccount.key.toBase58()}`);
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

    if (!nextPublicKey) {
      setResolvedNames([]);
    }

    trackEventOnce('send_address_keydown');
  };

  const handleResolveNameChange = ({ address, name }: any) => {
    setToTokenPublicKey(name);
    setUsernameResolvedAddress(address);
  };

  const hasBalance = fromTokenAccount?.balance
    ? fromTokenAccount.balance?.asNumber >= Number(fromAmount)
    : false;

  const isDisabled = isExecuting;
  const destinationAddress = usernameResolvedAddress ? usernameResolvedAddress : toTokenPublicKey;
  const isValidDestinationAddress = destinationAddress.length
    ? isValidAddress(isSolanaNetwork, destinationAddress, renNetwork)
    : true;

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

  const hasRenBtcMinimalAmount =
    isNetworkSourceSelectorVisible && !isSolanaNetwork ? renBtcMinimalAmount > 0 : true;

  return (
    <div>
      <WrapperWidgetPage title="Send" icon="top">
        <Wrapper>
          <FromWrapper>
            <FromToSelectInput
              tokenAccounts={tokenAccounts}
              tokenAccount={fromTokenAccount}
              token={fromTokenAccount?.balance?.token}
              amount={fromAmount}
              onTokenAccountChange={handleFromTokenAccountChange}
              onAmountChange={handleFromAmountChange}
              disabled={isDisabled}
            />
          </FromWrapper>
          <ToSendWrapper>
            <FromTitle>To</FromTitle>
            <ToAddressInput
              value={toTokenPublicKey || ''}
              resolvedAddress={usernameResolvedAddress}
              isAddressInvalid={!isValidDestinationAddress}
              onChange={handleToPublicKeyChange}
              resolvedNames={resolvedNames}
              onResolvedNameClick={handleResolveNameChange}
              isResolvingNames={isResolvingNames}
            />
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
                    onItemClick={() => setDestinationNetwork(network)}
                  >
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
                <RateUSD symbol={fromTokenAccount?.balance?.token.symbol} />{' '}
                <span>&nbsp;per {fromTokenAccount?.balance?.token.symbol} </span>
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
                  !isValidDestinationAddress ||
                  !hasBalance ||
                  (isShowConfirmAddressSwitch && !isConfirmCorrectAddress) ||
                  !hasRenBtcMinimalAmount
                }
                big
                full
                onClick={handleSubmit}
              >
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
