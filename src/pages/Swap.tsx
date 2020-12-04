import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { styled } from '@linaria/react';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';

const Wrapper = styled.div`
  width: 100%;
  max-width: 556px;
  margin-top: 25px;
`;

type Props = {};

export const Swap: FunctionComponent<Props> = (props) => {
  const { publicKey } = useParams<{ publicKey: string; status: string }>();

  const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: 'Swap ' }];

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      centered={
        <Wrapper>
          <SwapWidget publicKey={publicKey} />
        </Wrapper>
      }
    />
  );
};
