import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';
import type { Token } from 'new/sdk/SolanaSDK';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

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

const WrapperIcon = styled(BaseWrapper)`
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

type FromOneToOne = { fromOneToOne: { from?: Token; to?: Token } };
type OneImage = { oneImage: string };

export type ImageViewType = FromOneToOne | OneImage | null;

interface Props {
  imageView: ImageViewType;
  statusView: string | null;
  className?: string;
}

// TODO: status
export const TransactionImageView: FC<Props> = ({ imageView, statusView, className }) => {
  if ((imageView as FromOneToOne).fromOneToOne) {
    return (
      <WrapperFromOneToOne>
        <TokenAvatar token={(imageView as FromOneToOne).fromOneToOne.from} size={32} />
        <TokenAvatar token={(imageView as FromOneToOne).fromOneToOne.to} size={32} />
      </WrapperFromOneToOne>
    );
  }

  // @web: change className only for icon during hover
  return (
    <WrapperIcon className={className}>
      <TransactionIcon name={(imageView as OneImage).oneImage} />
    </WrapperIcon>
  );
};
