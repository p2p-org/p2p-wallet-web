import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { AddressText } from 'components/common/AddressText';
import { Icon } from 'components/ui';
import type { Recipient } from 'new/scenes/Main/Send';

const Wrapper = styled.div`
  display: flex;

  cursor: pointer;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.bg.secondary};
  border-radius: 12px;

  &.isFocused {
    background: ${theme.colors.bg.activePrimary};
    border: 1px solid ${theme.colors.textIcon.active};
  }

  &.isWarning {
    background: ${theme.colors.system.warningBg};
  }

  &.isError {
    background: ${theme.colors.system.errorBg};
  }
`;

const RecipientIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};

  &.isWarning {
    color: ${theme.colors.system.warningMain};
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;

  margin-left: 12px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const Description = styled.div`
  &.isWarning {
    color: ${theme.colors.system.warningMain};
  }
`;

const ClearWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 12px;

  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 8px;
  cursor: pointer;
`;

const ClearIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

interface Props {
  recipient?: Recipient;
  isPlaceholder?: boolean;
  onRecipientClick?: () => void;
  onClearClick?: () => void;
}

export const RecipientView: FC<Props> = observer(
  ({ recipient, isPlaceholder, onRecipientClick, onClearClick }) => {
    if (isPlaceholder) {
      return (
        <Wrapper>
          <Skeleton height={44} width={44} borderRadius={12} />
          <InfoWrapper>
            <Title>
              <Skeleton width={100} height={16} />
            </Title>
            <Description>
              <Skeleton width={150} height={14} />
            </Description>
          </InfoWrapper>
        </Wrapper>
      );
    }

    if (!recipient) {
      return null;
    }

    const shouldShowDescriptionLabel = recipient.hasNoFunds || recipient.hasNoInfo;

    const elIcon = expr(() => {
      if (!recipient.name && shouldShowDescriptionLabel) {
        return (
          <IconWrapper className={classNames({ isWarning: true })}>
            <RecipientIcon name="warning" className={classNames({ isWarning: true })} />
          </IconWrapper>
        );
      }

      return (
        <IconWrapper>
          <RecipientIcon name="wallet" />
        </IconWrapper>
      );
    });

    const elTitle = expr(() => {
      return (
        <Title>{recipient.name || <AddressText address={recipient.address} small gray />}</Title>
      );
    });

    const elDescription = expr(() => {
      if (!recipient.name) {
        if (shouldShowDescriptionLabel) {
          return (
            <Description className={classNames({ isWarning: true })}>
              {recipient.hasNoFunds
                ? 'Caution: this address has no funds'
                : 'Could not retrieve account info'}
            </Description>
          );
        }

        return null;
      }

      return (
        <Description>
          <AddressText address={recipient.address} small gray />
        </Description>
      );
    });

    return (
      <Wrapper onClick={onRecipientClick}>
        {elIcon}
        <InfoWrapper>
          {elTitle}
          {elDescription}
        </InfoWrapper>
        {onClearClick ? (
          <ClearWrapper onClick={onClearClick}>
            <ClearIcon name="cross" />
          </ClearWrapper>
        ) : null}
      </Wrapper>
    );
  },
);
