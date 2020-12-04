import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const PartWrapper = styled.div`
  display: flex;
  align-items: center;

  color: #000;
`;

const BreadcrumbLink = styled(Link)`
  color: #000;
  font-size: 14px;
  line-height: 140%;
  text-decoration: none;
`;

const ChevronWrapper = styled.div`
  padding: 0 8px;
`;

const ChevronIcon = styled(Icon)`
  width: 12px;
  height: 12px;

  color: #000;
  transform: rotate(-90deg);
`;

const Breadcrumb = styled.div`
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;
`;

export type BreadcrumbType = {
  name: string;
  to?: string;
};

type Props = {
  breadcrumbs: BreadcrumbType[];
};

export const Breadcrumbs: FunctionComponent<Props> = ({ breadcrumbs }) => {
  if (!breadcrumbs) {
    return null;
  }

  return (
    <Wrapper>
      {breadcrumbs.map((breadcrumb, index) => {
        if (index !== breadcrumbs.length - 1) {
          return (
            <PartWrapper key={breadcrumb.name}>
              <BreadcrumbLink to={breadcrumb.to}>{breadcrumb.name}</BreadcrumbLink>
              <ChevronWrapper>
                <ChevronIcon name="chevron" />
              </ChevronWrapper>
            </PartWrapper>
          );
        }

        return <Breadcrumb key={breadcrumb.name}>{breadcrumb.name}</Breadcrumb>;
      })}
    </Wrapper>
  );
};
