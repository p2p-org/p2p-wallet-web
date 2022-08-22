import type { FC } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';

import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import type { BreadcrumbType } from './types';

// NProgress.configure({ showSpinner: false, parent: '#container' });

type Props = {
  breadcrumb?: BreadcrumbType;
  mobileAction?: React.ReactNode;
  children: React.ReactNode;
};

export const LayoutOriginal: FC<Props> = ({ breadcrumb, mobileAction, children }) => {
  const isMobile = useIsMobile();
  const viewModel = useViewModel(LayoutViewModel);

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
        <MobileLayout viewModel={viewModel} breadcrumb={breadcrumb} action={mobileAction}>
          {children}
        </MobileLayout>
      ) : (
        <DesktopLayout viewModel={viewModel} breadcrumb={breadcrumb}>
          {children}
        </DesktopLayout>
      )}
    </>
  );
};

export const Layout = React.memo(LayoutOriginal);
