import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Card } from 'components/common/Card';
import { Layout } from 'components/common/Layout';

const WrapperCard = styled(Card)`
  width: 100%;
  max-width: 556px;
  margin-top: 25px;
`;

type Props = {};

export const Swap: FunctionComponent<Props> = (props) => {
  const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: 'Swap ' }];

  return (
    <Layout breadcrumbs={breadcrumbs} centered={<WrapperCard>Work in progress</WrapperCard>} />
  );
};
