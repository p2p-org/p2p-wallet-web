import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';
import { rgba } from 'polished';

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

import type { ImageViewType } from './TransactionImageView';
import { TransactionImageView, WrapperIcon } from './TransactionImageView';

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

  &.green {
    color: #2db533;
  }
`;

const TransactionImageViewStyled = styled(TransactionImageView)``;

const BottomStack = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const Main = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 12px;
  grid-template-columns: min-content 1fr;
  align-items: center;
  padding: 10px;

  cursor: pointer;

  &:hover {
    background: #f6f6f8;
    border-radius: 12px;

    ${TransactionImageViewStyled} {
      ${WrapperIcon} {
        background: #fff;
      }
    }

    ${TransactionTypeLabel} {
      color: #5887ff;
    }
  }
`;

interface Props {
  transaction?: ParsedTransaction;
  isPlaceholder?: boolean;
  onTransactionClick?: () => void;
}

export const TransactionCell: FC<Props> = observer(
  ({ transaction, isPlaceholder = false, onTransactionClick }) => {
    if (isPlaceholder || !transaction) {
      return (
        <Wrapper>
          <Main>
            <Skeleton width={48} height={48} borderRadius={12} />
            <div>
              <TopStack>
                <TransactionTypeLabel>
                  <Skeleton width={50} height={16} />
                </TransactionTypeLabel>
                <AmountInFiatLabel>
                  <Skeleton width={50} height={16} />
                </AmountInFiatLabel>
              </TopStack>
              <BottomStack>
                <div>
                  <Skeleton width={70} height={16} />
                </div>
                <div>
                  <Skeleton width={70} height={16} />
                </div>
              </BottomStack>
            </div>
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
      amountInFiatLabelTextColor,
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
          const newWallet = (transaction.info as CreateAccountInfo).newWallet;
          if (newWallet) {
            descriptionLabel = `${newWallet.token.symbol} Created`;
          }
          break;
        }
        case CloseAccountInfo: {
          const closedWallet = (transaction.info as CloseAccountInfo).closedWallet;
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
                descriptionLabel = `From ${source.pubkey ? truncatingMiddle(source.pubkey) : ''}`;
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
      let imageView: ImageViewType = null;
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
          statusImage = 'clock'; // @ios: transactionIndicatorPending
          break;
        case StatusType.error:
          statusImage = 'warning'; // @ios: transactionIndicatorError
          break;
        default:
          break;
      }

      // amount in fiat
      let amountInFiatLabel = null;
      let amountInFiatLabelTextColor = undefined;
      const amountInFiat = transaction.amountInFiat;
      if (amountInFiat) {
        let amountText = `${Defaults.fiat.symbol}${numberToString(amountInFiat, {
          maximumFractionDigits: 2,
          showMinus: false,
        })}`;
        if (transaction.amount < 0) {
          amountText = `- ${amountText}`;
        } else if (transaction.amount > 0) {
          amountText = `+ ${amountText}`;
          amountInFiatLabelTextColor = 'green';
        } else {
          amountText = '';
        }
        amountInFiatLabel = amountText;
      }

      // amount
      let amountInTokenLabel = null;
      if (!isUndefinedTransaction) {
        if (transaction.amount !== 0) {
          amountInTokenLabel = `${numberToString(transaction.amount, {
            maximumFractionDigits: 9,
            showPlus: true,
          })} ${transaction.symbol}`;
        }
      } else {
        const blockhash = transaction.blockhash;
        if (blockhash) {
          amountInTokenLabel = `#${truncatingMiddle(blockhash)}`;
        }
      }

      return {
        descriptionLabel,
        transactionTypeLabel,
        imageView,
        statusImage,
        amountInFiatLabel,
        amountInFiatLabelTextColor,
        amountInTokenLabel,
      };
    });

    return (
      <Wrapper>
        <Main onClick={onTransactionClick}>
          <TransactionImageViewStyled imageView={imageView} statusImage={statusImage} />
          <div>
            <TopStack>
              <TransactionTypeLabel>{transactionTypeLabel}</TransactionTypeLabel>
              <AmountInFiatLabel className={classNames(amountInFiatLabelTextColor)}>
                {amountInFiatLabel}
              </AmountInFiatLabel>
            </TopStack>
            <BottomStack>
              <div>{descriptionLabel}</div>
              <div>{amountInTokenLabel}</div>
            </BottomStack>
          </div>
        </Main>
      </Wrapper>
    );
  },
);
