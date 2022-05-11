import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Blockchain } from 'app/contexts';
import { TokenAvatarStyled } from 'components/common/TokenAccountRowContent';
import type { HandleSelectChangeParamType } from 'components/pages/send/SendWidget/Main/NetworkSelect/types';
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

const NetworkInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const NetworkTitle = styled.div`
  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  .isSelected & {
    font-weight: 700;
  }
`;

const FeeWrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const FeeTitle = styled.div`
  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
`;

const FeeValue = styled.div`
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

const avatarEl = (item: HandleSelectChangeParamType) => {
  if (item.key === 'auto') {
    return (
      <AvatarWrapper>
        <AvatarIcon name={'rocket'} />
      </AvatarWrapper>
    );
  }

  return <TokenAvatarStyled symbol={item.symbol} size={44} />;
};

const feeEl = (item: HandleSelectChangeParamType) => {
  if (item.key === 'auto') {
    return null;
  }

  return (
    <FeeWrapper>
      <FeeTitle>{item.feeTitle}</FeeTitle>
      <FeeValue className={classNames({ solana: item.key === Blockchain.solana })}>
        {item.feeValue}
      </FeeValue>
    </FeeWrapper>
  );
};

type RowPropsType = {
  item: HandleSelectChangeParamType;
};

export const Item: FC<RowPropsType> = ({ item }) => {
  return (
    <>
      {avatarEl(item)}
      <Content>
        <NetworkInfo>
          <NetworkTitle>{item.title}</NetworkTitle>
          {feeEl(item)}
        </NetworkInfo>
      </Content>
    </>
  );
};
