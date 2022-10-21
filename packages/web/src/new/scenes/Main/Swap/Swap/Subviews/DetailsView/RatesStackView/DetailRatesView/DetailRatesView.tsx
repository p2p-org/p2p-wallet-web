import type { FC } from 'react';

import { Row, Text } from 'components/ui/AccordionDetails/common';

interface Props {
  token: string;
  price: string;
  fiatPrice: string;
}

export const DetailRatesView: FC<Props> = ({ token, price, fiatPrice }) => {
  return (
    <Row>
      <Text className="gray nowrap">1 {token} price</Text>
      <Text className="flex-end right">
        {price} <Text className="gray">{fiatPrice}</Text>
      </Text>
    </Row>
  );
};
