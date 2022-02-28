import type { FC } from 'react';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import {
  SwapTransaction,
  titleCase,
  TransferTransaction,
  useTokenAccount,
  useTokenAccountAmount,
  useTransaction,
  useWallet,
} from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { TransactionSignature } from '@solana/web3.js';
import classNames from 'classnames';
import dayjs from 'dayjs';

import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { trackEvent } from 'utils/analytics';
import { getExplorerUrl } from 'utils/connection';
import { shortAddress } from 'utils/tokens';

import {
  BlockWrapper,
  ButtonExplorer,
  CloseIcon,
  CloseWrapper,
  Content,
  Desc,
  FieldsWrapper,
  FieldTitle,
  FieldValue,
  FieldWrapper,
  Footer,
  Header,
  OtherIcon,
  ProgressWrapper,
  SendWrapper,
  ShareIcon,
  ShareWrapper,
  SwapAmount,
  SwapBlock,
  SwapColumn,
  SwapIcon,
  SwapInfo,
  SwapWrapper,
  Title,
  ValueCurrency,
  ValueOriginal,
  Wrapper,
} from '../common/styled';

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  padding: 2px 10px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;

  background: rgba(246, 246, 248, 0.5);
  border-radius: 6px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 6px;

  background: #77db7c;
  border-radius: 2px;

  &.error {
    background: #f43d3d;
  }

  &.processing {
    background: #ffa631;
  }
`;

const FieldRowWrapper = styled(FieldWrapper)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 36px;
`;

const ColumnWrapper = styled.div``;

const FieldInfo = styled.div`
  display: flex;
  margin-top: 15px;
`;

const AddressWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 9px 0 12px;
`;

const AddressTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AddressValue = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const FieldTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const PaidByBadge = styled.div`
  padding: 1px 8px;

  color: #5887ff;
  font-weight: 600;
  font-size: 12px;

  background: #eff3ff;
  border-radius: 4px;
`;

type Props = {
  signature: TransactionSignature;
  source: string;
  close: () => void;
};

export const TransactionDetailsModal: FC<Props> = ({ signature, source, close }) => {
  const [isShowDetails, setShowDetails] = useState(false);
  const { network } = useWallet();
  const transaction = useTransaction(signature, source);

  const sourceTokenAccount = useTokenAccount(usePubkey(transaction?.data?.source));
  const destinationTokenAccount = useTokenAccount(usePubkey(transaction?.data?.destination));

  const tokenAmount = useTokenAccountAmount(
    usePubkey(transaction?.details.tokenAccount),
    transaction?.details.amount,
  );

  useEffect(() => {
    const type = transaction?.details.type;

    if (type === 'send') {
      trackEvent('Send_Process_Shown');
    } else if (type === 'swap') {
      trackEvent('Swap_Process_Shown');
    }
  }, [transaction?.details.type]);

  // useEffect(() => {
  //   const mount = async () => {
  //     const trx = unwrapResult(await dispatch(getTransaction(signature)));
  //
  //     if (!trx) {
  //       setTimeout(mount, 3000);
  //     }
  //   };
  //
  //   if (!transaction) {
  //     void mount();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [signature]);

  if (transaction?.loading) {
    return null;
  }

  const handleToggleShowDetailsClick = () => {
    setShowDetails((state) => !state);
  };

  const renderFromTo = () => {
    const type = transaction?.details.type;

    const source = transaction?.data?.source;
    const destination = transaction?.data?.destination;
    const sourceToken = sourceTokenAccount?.balance?.token;
    const destinationToken = destinationTokenAccount?.balance?.token;

    if (type === 'swap') {
      return (
        <>
          {transaction?.data?.source ? (
            <FieldWrapper>
              <FieldTitle>From</FieldTitle>
              <FieldValue>{transaction.data.source}</FieldValue>
            </FieldWrapper>
          ) : undefined}
          {transaction?.data?.destination ? (
            <FieldWrapper>
              <FieldTitle>To</FieldTitle>
              <FieldValue>{transaction.data.destination}</FieldValue>
            </FieldWrapper>
          ) : undefined}
        </>
      );
    }

    if (type && ((source && sourceToken) || (destination && destinationToken))) {
      return (
        <FieldRowWrapper>
          {source && sourceToken ? (
            <ColumnWrapper>
              <FieldTitle>From</FieldTitle>
              <FieldInfo>
                <TokenAvatar symbol={sourceToken.symbol} address={sourceToken.address} size={48} />
                <AddressWrapper>
                  <AddressTitle>{sourceToken.symbol}</AddressTitle>
                  <AddressValue>{shortAddress(source)}</AddressValue>
                </AddressWrapper>
              </FieldInfo>
            </ColumnWrapper>
          ) : undefined}
          {destination && destinationToken ? (
            <ColumnWrapper>
              <FieldTitle>To</FieldTitle>
              <FieldInfo>
                <TokenAvatar
                  symbol={destinationToken.symbol}
                  address={destinationToken.address}
                  size={48}
                />
                <AddressWrapper>
                  <AddressTitle>{destinationToken.symbol}</AddressTitle>
                  <AddressValue>{shortAddress(destination)}</AddressValue>
                </AddressWrapper>
              </FieldInfo>
            </ColumnWrapper>
          ) : undefined}
        </FieldRowWrapper>
      );
    }

    return null;
  };

  const renderAmountBlock = () => {
    const type = transaction?.details.type;

    const sourceToken = sourceTokenAccount?.balance?.token;
    const destinationToken = destinationTokenAccount?.balance?.token;

    if (type === 'swap') {
      return (
        <SwapWrapper>
          <SwapColumn>
            <SwapInfo>
              {sourceTokenAccount?.loading ? (
                <Skeleton width={44} height={44} borderRadius={12} />
              ) : (
                <TokenAvatar
                  symbol={sourceToken?.symbol}
                  address={sourceToken?.address}
                  size={44}
                />
              )}
              <SwapAmount>
                {sourceTokenAccount?.loading ? (
                  <Skeleton width={50} height={16} />
                ) : (
                  <>- {sourceTokenAccount?.balance?.formatUnits()}</>
                )}
              </SwapAmount>
            </SwapInfo>
          </SwapColumn>
          <SwapBlock>
            <SwapIcon name="swap" />
          </SwapBlock>
          <SwapColumn>
            <SwapInfo>
              {destinationTokenAccount?.loading ? (
                <Skeleton width={44} height={44} borderRadius={12} />
              ) : (
                <TokenAvatar
                  symbol={destinationToken?.symbol}
                  address={destinationToken?.address}
                  size={44}
                />
              )}
              <SwapAmount>
                {sourceTokenAccount?.loading ? (
                  <Skeleton width={80} height={16} />
                ) : (
                  <>+ {destinationTokenAccount?.balance?.formatUnits()}</>
                )}
              </SwapAmount>
            </SwapInfo>
          </SwapColumn>
        </SwapWrapper>
      );
    }

    if (transaction?.loading || sourceTokenAccount?.loading || tokenAmount.loading) {
      return (
        <SendWrapper>
          <Skeleton width={70} height={53} />
        </SendWrapper>
      );
    }

    if (tokenAmount.balance) {
      return (
        <SendWrapper>
          <ValueCurrency>
            {transaction?.details.isReceiver ? '+' : '-'} {tokenAmount.balance.formatUnits()}
          </ValueCurrency>
          <ValueOriginal>
            <AmountUSD
              prefix={transaction?.details.isReceiver ? '+' : '-'}
              value={tokenAmount.balance}
            />
          </ValueOriginal>
        </SendWrapper>
      );
    }

    return null;
  };

  const date = transaction?.raw?.blockTime
    ? dayjs.unix(transaction.raw.blockTime).format('LLL')
    : `${transaction?.raw?.slot} SLOT`;

  const isShowFeeBadge =
    transaction?.data instanceof TransferTransaction && transaction.data.wasPaidByP2POrg;

  return (
    <Wrapper>
      <Header>
        <Title>{titleCase(transaction?.details.type)}</Title>
        <Desc title={`${transaction?.raw?.slot} SLOT`}>{date}</Desc>
        <CloseWrapper onClick={close}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <BlockWrapper>
          {transaction?.details.icon ? <OtherIcon name={transaction.details.icon} /> : undefined}
        </BlockWrapper>
      </Header>
      <ProgressWrapper />
      <Content>
        {/* {details.typeOriginal === 'transfer' ? ( */}
        {/*  <SendWrapper> */}
        {/*    <ValueCurrency> */}
        {/*      {details.isReceiver ? '+' : '-'} {details.sourceAmount.toNumber()}{' '} */}
        {/*      {details.sourceToken?.symbol} */}
        {/*    </ValueCurrency> */}
        {/*    <ValueOriginal> */}
        {/*      <AmountUSD */}
        {/*        prefix={details.isReceiver ? '+' : '-'} */}
        {/*        symbol={details.sourceToken?.symbol} */}
        {/*        value={details.sourceAmount} */}
        {/*      /> */}
        {/*    </ValueOriginal> */}
        {/*  </SendWrapper> */}
        {/* ) : undefined} */}

        {renderAmountBlock()}
        <StatusWrapper>
          <Status>
            <StatusIndicator
              className={classNames({
                error: !!transaction?.raw?.meta?.err,
                // processing: !transaction?.raw?.slot,
              })}
            />{' '}
            {transaction?.raw?.meta?.err
              ? 'Failed'
              : !transaction?.raw?.slot
              ? 'Pending'
              : 'Completed'}
          </Status>
        </StatusWrapper>
        <FieldsWrapper>
          {isShowDetails ? (
            <>
              {renderFromTo()}
              {(sourceTokenAccount?.balance && destinationTokenAccount?.balance) ||
              tokenAmount?.balance ? (
                <FieldWrapper>
                  <FieldTitle>Amount</FieldTitle>
                  <FieldValue>
                    {transaction?.data instanceof SwapTransaction ? (
                      <>
                        {sourceTokenAccount?.balance?.formatUnits()} to{' '}
                        {destinationTokenAccount?.balance?.formatUnits()}
                      </>
                    ) : (
                      <>{tokenAmount?.balance?.formatUnits()}</>
                    )}
                  </FieldValue>
                </FieldWrapper>
              ) : undefined}
              {tokenAmount.balance ? (
                <FieldWrapper>
                  <FieldTitle>Value</FieldTitle>
                  <FieldValue>
                    <AmountUSD value={tokenAmount.balance} />
                  </FieldValue>
                </FieldWrapper>
              ) : undefined}
              {transaction?.raw?.meta ? (
                <FieldWrapper>
                  <FieldTitleWrapper>
                    <FieldTitle>Transaction fee</FieldTitle>
                    {isShowFeeBadge ? <PaidByBadge>Paid by p2p.org</PaidByBadge> : undefined}
                  </FieldTitleWrapper>
                  <FieldValue>{transaction.raw.meta?.fee} lamports</FieldValue>
                </FieldWrapper>
              ) : null}
              <FieldWrapper>
                <FieldTitle>Block number</FieldTitle>
                <FieldValue>#{transaction?.raw?.slot}</FieldValue>
              </FieldWrapper>
            </>
          ) : undefined}
          <FieldWrapper>
            <FieldTitle>Transaction ID</FieldTitle>
            <FieldValue>
              {signature}{' '}
              <a
                href={getExplorerUrl('tx', signature, network)}
                target="_blank"
                rel="noopener noreferrer noindex"
                className="button"
              >
                <ShareWrapper>
                  <ShareIcon name="external" />
                </ShareWrapper>
              </a>
            </FieldValue>
          </FieldWrapper>
        </FieldsWrapper>
      </Content>
      <Footer className={classNames({ isCentered: true })}>
        <ButtonExplorer lightGray onClick={handleToggleShowDetailsClick}>
          {isShowDetails ? 'Hide transaction details' : 'Show transaction details'}
        </ButtonExplorer>
      </Footer>
    </Wrapper>
  );
};
