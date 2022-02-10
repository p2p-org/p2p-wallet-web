import { styled } from '@linaria/react';

import { Modal } from 'components/ui/Modal';

export const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

export const Section = styled.div`
  display: grid;
  grid-gap: 24px;
  padding: 16px 0 24px;
`;

export const List = styled.ul`
  display: grid;
  grid-gap: 16px;
  margin: 0;
  padding-left: 32px;
`;

export const Row = styled.li``;
