import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { SendWidget } from 'components/pages/send/SendWidget';

const Wrapper = styled.div``;

type Props = {};

export const Send: FunctionComponent<Props> = (props) => {
  const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: 'Send ' }];

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      centered={
        <Wrapper>
          <SendWidget />
        </Wrapper>
      }
    />
  );
};
