import type { FC } from 'react';

import { useSettings } from 'app/contexts';
import type { Accordion } from 'components/ui/AccordionDetails';
import { AccordionDetails } from 'components/ui/AccordionDetails';

import { FreeTransactionTooltip } from './FreeTransactionTooltip';

// const ListWrapper = styled.div`
//   display: grid;
//   grid-gap: 4px;
//   padding: 16px 20px;
//
//   &.total {
//     padding: 26px 20px;
//   }
//
//   &:not(:last-child) {
//     border-bottom: 1px solid ${theme.colors.stroke.secondary};
//   }
// `;

// const Row = styled.div`
//   display: flex;
//   justify-content: space-between;
// `;
//
// const Text = styled.div`
//   display: inline-block;
//
//   color: ${theme.colors.textIcon.primary};
//   font-weight: 500;
//   font-size: 16px;
//   line-height: 140%;
//   letter-spacing: 0.01em;
//
//   &.inline-flex {
//     display: inline-flex;
//   }
//
//   &.gray {
//     color: ${theme.colors.textIcon.secondary};
//   }
//
//   &.green {
//     color: ${theme.colors.system.successMain};
//   }
// `;

// {/*<ListWrapper>*/}
// {/*  <Row>*/}
// {/*    <Text className="gray">Receive</Text>*/}
// {/*    <Text>*/}
// {/*      150.1 USDC <Text className="gray">(~$150)</Text>*/}
// {/*    </Text>*/}
// {/*  </Row>*/}
// {/*  <Row>*/}
// {/*    <Text className="gray">Transaction fee</Text>*/}
// {/*    {useFreeTransactions ? (*/}
// {/*      <Text>*/}
// {/*        Free{' '}*/}
// {/*        <Text className="green inline-flex">*/}
// {/*          (Paid by P2P.org) <FreeTransactionTooltip />*/}
// {/*        </Text>*/}
// {/*      </Text>*/}
// {/*    ) : (*/}
// {/*      <Text>1</Text>*/}
// {/*    )}*/}
// {/*  </Row>*/}
// {/*  <Row>*/}
// {/*    <Text className="gray">USDC account creation</Text>*/}
// {/*    <Text>*/}
// {/*      0.509 USDC <Text className="gray">(~$0.5)</Text>*/}
// {/*    </Text>*/}
// {/*  </Row>*/}
// {/*</ListWrapper>*/}
// {/*<ListWrapper className="total">*/}
// {/*  <Row>*/}
// {/*    <Text>Total</Text>*/}
// {/*    <Text>*/}
// {/*      150.609 USDC <Text className="gray">(~$150.5)</Text>*/}
// {/*    </Text>*/}
// {/*  </Row>*/}
// {/*</ListWrapper>*/}

interface Props {}

// TODO: look at TransferFee component and make what need to do
export const TransactionDetails: FC<Props> = () => {
  const {
    settings: { useFreeTransactions },
  } = useSettings();

  const accordion: Accordion = [
    {
      id: 1,
      rows: [
        {
          id: 1,
          titleClassName: 'gray',
          title: 'Receive',
          value: [
            '150.1 USDC',
            ' ',
            {
              className: 'gray',
              value: '(~$150)',
            },
          ],
        },
        {
          id: 2,
          titleClassName: 'gray',
          title: 'Transaction fee',
          value: useFreeTransactions
            ? [
                'Free',
                ' ',
                {
                  className: 'green inline-flex',
                  value: (
                    <>
                      (Paid by P2P.org) <FreeTransactionTooltip />
                    </>
                  ),
                },
              ]
            : 1,
        },
        {
          id: 3,
          titleClassName: 'gray',
          title: 'USDC account creation',
          value: [
            '0.509 USDC',
            ' ',
            {
              className: 'gray',
              value: '(~$0.5)',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      className: 'total',
      rows: [
        {
          id: 1,
          title: 'Total',
          value: [
            '150.609 USDC',
            ' ',
            {
              className: 'gray',
              value: '(~$150.5)',
            },
          ],
        },
      ],
    },
  ];

  return (
    <AccordionDetails
      title="Transaction details"
      titleBottomName="Total"
      titleBottomValue="150.609 USDC"
      accordion={accordion}
    />
  );
};
