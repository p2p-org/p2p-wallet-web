import type { FunctionComponent } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import type { BreadcrumbType } from './types';

// NProgress.configure({ showSpinner: false, parent: '#container' });

type Props = {
  breadcrumb?: BreadcrumbType;
  mobileAction?: React.ReactNode;
  children: React.ReactNode;
};

export const LayoutOrigin: FunctionComponent<Props> = ({ breadcrumb, mobileAction, children }) => {
  const isMobile = useIsMobile();

  // useEffect(() => {
  //   if (loading) {
  //     NProgress.start();
  //   } else {
  //     NProgress.done();
  //   }
  // }, [loading]);

  return (
    <>
      <Helmet>
        <body className="" />
      </Helmet>
      {isMobile ? (
        <MobileLayout breadcrumb={breadcrumb} action={mobileAction}>
          {children}
        </MobileLayout>
      ) : (
        <DesktopLayout breadcrumb={breadcrumb}>{children}</DesktopLayout>
      )}
    </>
  );
};

export const Layout = React.memo(LayoutOrigin);
