import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';

import { Icon } from 'components/ui';

const IconStyled = styled(Icon)`
  width: 16px;
  height: 16px;

  color: ${theme.colors.textIcon.secondary};
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;

  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg.activePrimary};
    ${borders.linksRGBA}
  }
`;

const IconWrapper = styled.div`
  margin-right: 8px;
`;

type Props = {
  icon?: string;
  onItemClick: () => void;
  close?: () => void;
};

export const MenuItem: FunctionComponent<Props> = ({
  icon,
  children,
  onItemClick,
  close = () => {},
}) => {
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    onItemClick();
    close();
  };

  return (
    <Wrapper onClick={handleItemClick}>
      {icon ? (
        <IconWrapper>
          <IconStyled name={icon} />
        </IconWrapper>
      ) : undefined}
      {children}
    </Wrapper>
  );
};
