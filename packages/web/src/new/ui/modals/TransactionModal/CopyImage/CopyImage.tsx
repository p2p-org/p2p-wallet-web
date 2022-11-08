import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const CopyIcon = styled(Icon)`
  width: 21px;
  height: 21px;

  color: #a3a5ba;
`;

const Wrapper = styled.span`
  width: 32px;
  height: 32px;

  cursor: pointer;

  &:hover {
    ${CopyIcon} {
      color: #5887ff;
    }
  }
`;

interface Props {
  className?: string;
}

export const CopyImage: FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <CopyIcon name="copy" />
    </Wrapper>
  );
};
