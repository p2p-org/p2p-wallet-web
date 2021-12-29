import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 140%;
  text-align: center;
`;

const LockIcon = styled(Icon)`
  width: 20px;
  margin-right: 8px;

  color: #a3a5ba;
`;

export const Hint: FC = () => {
  return (
    <Wrapper>
      <LockIcon name="lock" /> All deposits are stored 100% non-custodiallity with keys held on this
      device
    </Wrapper>
  );
};
