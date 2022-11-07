import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';
import type { Token } from 'new/sdk/SolanaSDK';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

const Wrapper = styled.div`
  position: relative;
`;

const BaseWrapper = styled.div`
  width: 48px;
  height: 48px;
`;

const WrapperFromOneToOne = styled(BaseWrapper)`
  position: relative;

  & > :nth-child(1) {
    position: absolute;
    top: 0;
    left: 0;
  }

  & > :nth-child(2) {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`;

export const WrapperIcon = styled(BaseWrapper)`
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

const StatusWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusIcon = styled(Icon)`
  margin-left: 9px;

  &.clock {
    width: 15px;
    height: 15px;

    color: #ffa631;
  }

  &.warning {
    width: 16px;
    height: 16px;

    color: #f43d3d;
  }
`;

type FromOneToOne = { fromOneToOne: { from?: Token; to?: Token } };
type OneImage = { oneImage: string };

export type ImageViewType = FromOneToOne | OneImage | null;

interface Props {
  imageView: ImageViewType;
  statusImage: string | null;
  className?: string;
}

export const TransactionImageView: FC<Props> = ({ imageView, statusImage, className }) => {
  const renderEl = () => {
    if ((imageView as FromOneToOne).fromOneToOne) {
      return (
        <WrapperFromOneToOne>
          <TokenAvatar token={(imageView as FromOneToOne).fromOneToOne.from} size={32} />
          <TokenAvatar token={(imageView as FromOneToOne).fromOneToOne.to} size={32} />
        </WrapperFromOneToOne>
      );
    }

    return (
      <WrapperIcon>
        <TransactionIcon name={(imageView as OneImage).oneImage} />
      </WrapperIcon>
    );
  };

  return (
    <Wrapper className={className}>
      {renderEl()}
      {statusImage ? (
        <StatusWrapper>
          <StatusIcon name={statusImage} className={statusImage} />
        </StatusWrapper>
      ) : null}
    </Wrapper>
  );
};
