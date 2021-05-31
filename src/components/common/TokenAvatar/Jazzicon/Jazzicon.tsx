import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { Jazzicon as Icon } from '@ukstv/jazzicon-react';

const Wrapper = styled.div<{ size: string | number | undefined }>`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  height: ${({ size }) => (size ? `${size}px` : 'auto')};
`;

const IconStyled = styled(Icon)`
  & div {
    border-radius: 12px !important;
  }
`;

interface Props {
  address: string;
  size?: string | number | undefined;
  className?: string;
}

export const Jazzicon: FC<Props> = ({ address, size, className, ...props }) => {
  return (
    <Wrapper size={size} className={className}>
      <IconStyled address={address} {...props} />
    </Wrapper>
  );
};
