import type { FunctionComponent, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.img<{ size: string | number | undefined }>`
  width: ${({ size }) => (size ? `${size}px` : 'auto')};
  height: ${({ size }) => (size ? `${size}px` : 'auto')};

  border-radius: 12px;

  /* transparent pixel for not showing border if no src */
  &:not([src]) {
    content: url('data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
  }
`;

type Props = {
  src?: string;
  size?: string | number;
};

export const Avatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  src,
  size,
  ...props
}) => {
  return <Wrapper src={src} size={size} {...props} />;
};
