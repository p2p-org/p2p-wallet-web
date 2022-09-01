import type { FC } from 'react';
import type { UseAsyncReturn } from 'react-async-hook';

import { Accordion } from 'components/ui';
import { LoaderBlock } from 'new/ui/components/common/LoaderBlock';

interface Props {
  totalFee: UseAsyncReturn<string, any>;
}

export const FeesAccordion: FC<Props> = ({ totalFee, children }) => {
  return (
    <Accordion
      title="Swap fees"
      right={totalFee.loading ? <LoaderBlock /> : totalFee.result}
      hideRightIfOpen
      noContentPadding
      open // FIXME after redesign
    >
      {children}
    </Accordion>
  );
};
