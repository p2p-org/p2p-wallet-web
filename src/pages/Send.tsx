import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { styled } from '@linaria/react';

import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';

const Wrapper = styled.div`
  width: 100%;
  max-width: 556px;
  margin-top: 25px;
`;

type Props = {};

export const Send: FunctionComponent<Props> = (props) => {
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();

  const breadcrumbs: { name: string; to?: string }[] = [{ name: 'Wallets', to: '/wallets' }];

  if (status === 'result') {
    breadcrumbs.push({ name: 'Send', to: `/send/${publicKey}` }, { name: 'Result' });
  } else {
    breadcrumbs.push({ name: 'Send' });
  }

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      centered={
        <Wrapper>
          {status !== 'result' ? <SendWidget publicKey={publicKey} /> : <ResultWidget />}
        </Wrapper>
      }
    />
  );
};
