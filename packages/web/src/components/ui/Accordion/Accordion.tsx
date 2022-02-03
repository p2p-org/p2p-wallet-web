import type { FC } from 'react';
import { useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  border: 1px solid ${theme.colors.stroke.secondary};
  border-radius: 12px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 12px 20px;

  cursor: pointer;

  &.isOpen {
    border-bottom: 1px solid ${theme.colors.stroke.secondary};
  }
`;

const Title = styled.div`
  display: flex;
  flex: 1;
  align-content: space-between;

  font-weight: 600;
  font-size: 16px;
`;

const Left = styled.div`
  display: flex;
  flex-grow: 1;
`;

const Right = styled.div`
  margin-right: 12px;
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: ${theme.colors.textIcon.secondary};

  &.isOpen {
    transform: rotate(180deg);
  }
`;

const Content = styled.div`
  &:not(.noContentPadding) {
    padding: 16px 20px;
  }
`;

type Props = {
  title: string | React.ReactNode;
  right?: string | React.ReactNode;
  open?: boolean;
  hideRightIfOpen?: boolean;
  noContentPadding?: boolean;
  className?: string;
};

export const Accordion: FC<Props> = ({
  title,
  right,
  open = false,
  hideRightIfOpen,
  noContentPadding,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <Wrapper className={className}>
      <TitleWrapper onClick={() => setIsOpen(!isOpen)} className={classNames({ isOpen })}>
        <Title>
          <Left>{title}</Left>
          {right ? hideRightIfOpen && isOpen ? undefined : <Right>{right}</Right> : undefined}
        </Title>
        <ChevronIcon name="chevron" className={classNames({ isOpen })} />
      </TitleWrapper>
      {isOpen ? (
        <Content className={classNames({ noContentPadding })}>{children}</Content>
      ) : undefined}
    </Wrapper>
  );
};
