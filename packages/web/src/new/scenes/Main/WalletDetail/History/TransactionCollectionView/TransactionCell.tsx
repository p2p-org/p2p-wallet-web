import type { FC } from 'react';
import * as React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { expr } from 'mobx-utils';
import { rgba } from 'polished';

import { BaseWrapper } from 'components/pages/wallet/TransactionsWidget/TransactionRow/common/styled';
import { Icon } from 'components/ui';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import {
  CloseAccountInfo,
  CreateAccountInfo,
  StatusType,
  SwapInfo,
  TransferInfo,
  TransferType,
} from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import { numberToString } from 'new/utils/NumberExtensions';
import {
  parsedTransactionIcon,
  parsedTransactionLabel,
} from 'new/utils/SolanaSDK.ParsedTransactionExtensions';
import { truncatingMiddle } from 'new/utils/StringExtensions';

const Wrapper = styled.div`
  position: relative;

  padding: 10px 0;

  &:not(:last-child) {
    &::after {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

      content: '';
    }
  }
`;

const TransactionIconWrapper = styled(BaseWrapper)`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #f6f6f8;
  border-radius: 12px;
`;

const TransactionIcon = styled(Icon)`
  width: 25px;
  height: 25px;

  color: #a3a5ba;
`;

const Content = styled.div`
  flex: 1;
`;

const TopStack = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const TransactionTypeLabel = styled.div`
  text-transform: capitalize;
`;

const AmountInFiatLabel = styled.div`
  display: flex;
  align-items: center;
`;

const Amount = styled.div`
  &.isReceiver {
    color: #2db533;
  }
`;

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WarningIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-left: 9px;

  color: #f43d3d;
`;

// const ClockIcon = styled(Icon)`
//   width: 15px;
//   height: 15px;
//   margin-left: 9px;
//
//   color: #ffa631;
// `;

const Main = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;

  cursor: pointer;

  &:hover {
    background: #f6f6f8;
    border-radius: 12px;

    ${TransactionIconWrapper} {
      background: #fff;
    }

    ${TransactionTypeLabel} {
      color: #5887ff;
    }
  }
`;

const BottomStack = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const LinkStyled = styled(Link)`
  color: #a3a5ba;
  text-decoration: none;
`;

interface Props {
  transaction: ParsedTransaction;
  isPlaceholder: boolean;
}

export const TransactionCell: FC<Props> = ({ transaction, isPlaceholder }) => {
  if (isPlaceholder) {
    return (
      <Wrapper>
        <Main onClick={() => {}}>
          <Skeleton width={48} height={48} borderRadius={12} />
          <Content>
            <TopStack>
              <TransactionTypeLabel>
                <Skeleton width={50} height={16} />
              </TransactionTypeLabel>
              <AmountInFiatLabel>
                <Skeleton width={50} height={16} />
              </AmountInFiatLabel>
            </TopStack>
            <BottomStack>
              <div />
              <div>
                <Skeleton width={70} height={16} />
              </div>
            </BottomStack>
          </Content>
        </Main>
      </Wrapper>
    );
  }

  const {
    descriptionLabel,
    transactionTypeLabel,
    imageView,
    statusImage,
    amountInFiatLabel,
    amountInTokenLabel,
  } = expr(() => {
    // clear
    let descriptionLabel = null;

    // type
    const transactionTypeLabel = parsedTransactionLabel(transaction);

    // description texts
    let isUndefinedTransaction = false;
    switch (transaction.info?.constructor) {
      case CreateAccountInfo: {
        const newWallet = (transaction as CreateAccountInfo).newWallet;
        if (newWallet) {
          descriptionLabel = `${newWallet.token.symbol} Created`;
        }
        break;
      }
      case CloseAccountInfo: {
        const closedWallet = (transaction as CloseAccountInfo).closedWallet;
        if (closedWallet) {
          descriptionLabel = `${closedWallet.token.symbol} Closed`;
        }
        break;
      }
      case TransferInfo: {
        switch ((transaction.info as TransferInfo).transferType) {
          case TransferType.send: {
            const destination = (transaction.info as TransferInfo).destination;
            if (destination) {
              descriptionLabel = `To ${
                destination.pubkey ? truncatingMiddle(destination.pubkey) : ''
              }`;
            }
            break;
          }
          case TransferType.receive: {
            const source = (transaction.info as TransferInfo).source;
            if (source) {
              descriptionLabel = `From token ${
                source.pubkey ? truncatingMiddle(source.pubkey) : ''
              }`;
            }
            break;
          }
          default:
            break;
        }
        break;
      }
      case SwapInfo: {
        const source = (transaction.info as SwapInfo).source;
        const destination = (transaction.info as SwapInfo).destination;
        if (source && destination) {
          descriptionLabel = `${source.token.symbol} to ${destination.token.symbol}`;
        }
        break;
      }
      default: {
        const signature = transaction.signature;
        if (signature) {
          descriptionLabel = truncatingMiddle(signature);
        }
        isUndefinedTransaction = true;
      }
    }

    // set up icon
    let imageView = null;
    switch (transaction.info?.constructor) {
      case SwapInfo: {
        imageView = {
          fromOneToOne: {
            from: (transaction.info as SwapInfo).source?.token,
            to: (transaction.info as SwapInfo).destination?.token,
          },
        };
        break;
      }
      default:
        imageView = { oneImage: parsedTransactionIcon(transaction) };
    }

    // set up status icon
    let statusImage = null;
    switch (transaction.status.type) {
      case StatusType.requesting:
      case StatusType.processing:
        statusImage = ''; // TODO:
        break;
      case StatusType.error:
        statusImage = ''; // TODO:
        break;
      default:
        break;
    }

    // amount in fiat
    let amountInFiatLabel = null;
    // amountInFiatLabel text black
    const amountInFiat = transaction.amountInFiat;
    if (amountInFiat) {
      let amountText = `${Defaults.fiat.symbol}${numberToString(amountInFiat, {
        maximumFractionDigits: 2,
        showMinus: false,
      })}`;
      // textColor = textBlack
      if (transaction.amount < 0) {
        amountText = `- ${amountText}`;
      } else if (transaction.amount > 0) {
        amountText = `+ ${amountText}`;
        // textColor = attention gree
      } else {
        amountText = '';
      }
      amountInFiatLabel = amountText;
      // amountInFiatLabel.textColor = textColor
    }

    // amount
    let amountInTokenLabel = null;
    if (!isUndefinedTransaction) {
      if (transaction.amount !== 0) {
        amountInTokenLabel = `${numberToString(transaction.amount, {
          maximumFractionDigits: 9,
          showPlus: true,
        })}`;
      }
    }

    return {
      descriptionLabel,
      transactionTypeLabel,
      imageView,
      statusImage,
      amountInFiatLabel,
      amountInTokenLabel,
    };
  });

  return (
    <Wrapper>
      <Main onClick={() => {}}>
        <Content>
          <TopStack>
            <TransactionTypeLabel>{transactionTypeLabel}</TransactionTypeLabel>
            <AmountInFiatLabel>{amountInFiatLabel}</AmountInFiatLabel>
          </TopStack>
          <BottomStack>
            <div>{descriptionLabel}</div>
            <div>{amountInTokenLabel}</div>
          </BottomStack>
        </Content>
      </Main>
    </Wrapper>
  );
};
