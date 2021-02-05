import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { Cluster } from '@solana/web3.js';
import classNames from 'classnames';

import { Icon } from 'components/ui';
import { CLUSTERS } from 'config/constants';
import { RootState } from 'store/rootReducer';
import { wipeAction } from 'store/slices/GlobalSlice';
import { connect, selectCluster } from 'store/slices/wallet/WalletSlice';

import { ClusterRow } from './ClusterRow';

const Wrapper = styled.div`
  position: relative;

  background: #f6f6f8;
  border-radius: 12px;
`;

const PlugWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;

  background: #fff;
  border-radius: 8px;
`;

const PlugIcon = styled(Icon)`
  width: 15px;
  height: 15px;

  color: #a3a5ba;
`;

const Value = styled.div`
  max-width: 83px;
  margin: 0 6px 0 8px;
  overflow: hidden;

  color: #202020;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
  white-space: nowrap;

  text-overflow: ellipsis;
`;

const Selector = styled.div`
  display: flex;
  align-items: center;
  max-width: 153px;
  margin: 4px;

  cursor: pointer;

  &.isOpen,
  &:hover {
    ${PlugIcon},
    ${Value} {
      color: #5887ff;
    }
  }
`;

const ArrowWrapper = styled.div`
  margin-right: 4px;
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const DropDownList = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  min-width: 204px;
  margin-top: 8px;
  padding: 8px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

export const ClusterSelector: FunctionComponent = () => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  const handleAwayClick = (e: MouseEvent) => {
    if (!selectorRef.current?.contains(e.target as HTMLDivElement)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  const handleSelectorClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (newCluster: Cluster) => {
    setIsOpen(false);
    batch(async () => {
      dispatch(selectCluster(newCluster));
      dispatch(wipeAction());
      await dispatch(connect());
    });
  };

  return (
    <Wrapper ref={selectorRef}>
      <Selector onClick={handleSelectorClick} className={classNames({ isOpen })}>
        <PlugWrapper>
          <PlugIcon name="plug" />
        </PlugWrapper>
        <Value>{cluster}</Value>
        <ArrowWrapper>
          <ArrowIcon name="arrow-triangle" />
        </ArrowWrapper>
      </Selector>
      {isOpen ? (
        <DropDownList>
          {CLUSTERS.map((itemCluster) => (
            <ClusterRow
              key={itemCluster}
              isSelected={cluster === itemCluster}
              cluster={itemCluster}
              onItemClick={handleItemClick}>
              {itemCluster}
            </ClusterRow>
          ))}
        </DropDownList>
      ) : undefined}
    </Wrapper>
  );
};
