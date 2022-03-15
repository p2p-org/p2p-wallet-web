import type { FC } from 'react';
import JazziconSolana, { jsNumberForAddress } from 'react-solana-jazzicon';

import { styled } from '@linaria/react';

const Wrapper = styled.div<{ size: Props['size'] }>`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  height: ${({ size }) => (size ? `${size}px` : 'auto')};
`;

const IconStyled = styled.div`
  & div {
    border-radius: 12px !important;
  }
`;

interface Props {
  address: string;
  size?: number;
  className?: string;
}

export const Jazzicon: FC<Props> = ({ address, size, className }) => {
  return (
    <Wrapper size={size} className={className}>
      <IconStyled>
        <JazziconSolana seed={jsNumberForAddress(address)} diameter={size} />
      </IconStyled>
    </Wrapper>
  );
};
