import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  background-color: #fff;
  border-radius: 15px;
`;

const Header = styled.div`
  position: relative;

  padding: 20px 30px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const Title = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 100%;
`;

const Description = styled.div`
  margin-top: 10px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: #f6f6f8;
  border-radius: 8px;

  cursor: pointer;
`;

const CloseIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const Content = styled.div``;

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  close?: () => void;
  className?: string;
};

export const Modal: FunctionComponent<Props> = ({
  title,
  description,
  close,
  children,
  className,
}) => {
  return (
    <Wrapper className={className}>
      <Header>
        {title ? <Title>{title}</Title> : undefined}
        {description ? <Description>{description}</Description> : undefined}
        {close ? (
          <CloseWrapper onClick={close}>
            <CloseIcon name="close" />
          </CloseWrapper>
        ) : undefined}
      </Header>
      {children ? <Content>{children}</Content> : undefined}
    </Wrapper>
  );
};
