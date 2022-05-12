import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Blockchain } from 'app/contexts';
import { TokenAvatarStyled } from 'components/common/TokenAccountRowContent';
import type { SelectItemValueType } from 'components/pages/send/SendWidget/Main/NetworkSelect/types';
import { Icon } from 'components/ui';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
`;

const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.bg.secondary};
  border-radius: 12px;
`;

const AvatarIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FirstLineWrapper = styled.div`
  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  .isSelected & {
    font-weight: 700;
  }
`;

const SecondLineWrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const SecondLineTitle = styled.div`
  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
`;

const SecondLineValue = styled.div`
  margin-left: 4px;

  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 14px;
  line-height: 140%;

  &.solana {
    color: ${theme.colors.system.successMain};

    font-weight: 700;
  }
`;

const avatarEl = (item: SelectItemValueType) => {
  if (item.key === 'auto') {
    return (
      <AvatarWrapper>
        <AvatarIcon name={'rocket'} />
      </AvatarWrapper>
    );
  }

  return <TokenAvatarStyled symbol={item.symbol} size={44} />;
};

const firstLineEl = (item: SelectItemValueType, forValue?: boolean) => {
  let title = '';

  if (item.key === 'auto' && forValue) {
    title = item.forValue.title;
  } else {
    title = item.title;
  }

  return <FirstLineWrapper>{title}</FirstLineWrapper>;
};

const secondLineEl = (item: SelectItemValueType, forValue?: boolean) => {
  let title = null;
  let value = null;

  if (item.key === 'auto') {
    if (forValue) {
      title = item.forValue.description;
    }
  } else {
    title = item.feeTitle;
    value = item.feeValue;
  }

  if (!title) {
    return null;
  }

  return (
    <SecondLineWrapper>
      <SecondLineTitle>{title}</SecondLineTitle>
      {value ? (
        <SecondLineValue className={classNames({ solana: item.key === Blockchain.solana })}>
          {value}
        </SecondLineValue>
      ) : null}
    </SecondLineWrapper>
  );
};

type RowPropsType = {
  item: SelectItemValueType;
  forValue?: boolean;
};

export const Item: FC<RowPropsType> = ({ item, forValue }) => {
  return (
    <>
      {avatarEl(item)}
      <Content>
        <InfoWrapper>
          {firstLineEl(item, forValue)}
          {secondLineEl(item, forValue)}
        </InfoWrapper>
      </Content>
    </>
  );
};
