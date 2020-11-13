import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';

const Wrapper = styled.div`
  width: 100%;
  max-width: 556px;
  margin-top: 25px;
`;

type Props = {};

export const Swap: FunctionComponent<Props> = (props) => {
  const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: 'Swap ' }];

  return <Layout breadcrumbs={breadcrumbs} centered={<Wrapper>123</Wrapper>} />;
};
