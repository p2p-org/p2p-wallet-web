import type { FunctionComponent, HTMLAttributes } from 'react';
import { useState } from 'react';

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

const BAD_SRCS: { [src: string]: true } = {};

type Props = {
  src?: string;
  size?: string | number;
};

export const Avatar: FunctionComponent<Props & HTMLAttributes<HTMLDivElement>> = ({
  src,
  size,
  ...props
}) => {
  const [, refresh] = useState<number>(0);

  const _src: string | undefined = src && !BAD_SRCS[src] ? src : undefined;

  return (
    <Wrapper
      src={_src}
      size={size}
      {...props}
      onError={() => {
        if (src) {
          BAD_SRCS[src] = true;
        }
        refresh((i) => i + 1);
      }}
    />
  );
};
