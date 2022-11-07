import type { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: #fff;
  border: 1px solid #161616;
  border-radius: 12px;
  cursor: pointer;
`;

const BackIcon = styled(Icon)`
  width: 12px;
  height: 12px;

  color: #161616;
`;

export const Back: FC<HTMLAttributes<HTMLDivElement>> = ({ onClick, className }) => {
  return (
    <Wrapper onClick={onClick} className={className}>
      <BackIcon name="arrow" />
    </Wrapper>
  );
};
