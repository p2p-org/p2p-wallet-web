import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { Cluster } from '@solana/web3.js';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const CheckmarkIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: transparent;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 8px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color: #5887ff;

    background: #f6f6f8;

    ${CheckmarkIcon} {
      color: #a3a5ba;
    }
  }

  &.isSelected {
    ${CheckmarkIcon} {
      color: #5887ff;
    }
  }
`;

type Props = {
  isSelected: boolean;
  cluster: Cluster;
  onItemClick: (cluster: Cluster) => void;
};

export const ClusterRow: FunctionComponent<Props> = ({
  children,
  isSelected,
  cluster,
  onItemClick,
}) => {
  const handleClick = () => {
    onItemClick(cluster);
  };

  return (
    <Wrapper onClick={handleClick} className={classNames({ isSelected })}>
      {children} <CheckmarkIcon name="checkmark" />
    </Wrapper>
  );
};
