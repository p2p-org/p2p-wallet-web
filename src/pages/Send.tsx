import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { SendWidget } from 'components/pages/send/SendWidget';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

const Wrapper = styled.div`
  width: 100%;
  max-width: 556px;
  margin-top: 25px;
`;

type Props = {};

export const Send: FunctionComponent<Props> = (props) => {
  const { symbol: aliasSymbol } = useParams<{ symbol: string }>();
  const { mint } = usePopulateTokenInfo({
    mint: aliasSymbol,
    symbol: aliasSymbol,
  });

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
