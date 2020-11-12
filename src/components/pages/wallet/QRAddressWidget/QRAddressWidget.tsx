import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Card } from 'components/common/Card';

const WrapperCard = styled(Card)`
  flex: 1;
`;

type Props = {};

export const QRAddressWidget: FunctionComponent<Props> = (props) => {
  return <WrapperCard>QRAddressWidget</WrapperCard>;
};
