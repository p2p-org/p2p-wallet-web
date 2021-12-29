import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { Drawer } from 'components/pages/landing/common/Drawer';
import { Features } from 'components/pages/landing/Features';
import { Footer } from 'components/pages/landing/Footer';
import { Functions } from 'components/pages/landing/Functions';
import { Header } from 'components/pages/landing/Header';
import { fonts } from 'components/pages/landing/styles/fonts';
import { Top } from 'components/pages/landing/Top';
import { Under } from 'components/pages/landing/Under';
// import { Updates } from 'components/pages/landing/Updates';
import { YouCan } from 'components/pages/landing/YouCan/YouCan';
import { trackEvent } from 'utils/analytics';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

export const global = css`
  :global() {
    body.landing {
      background: #161616;

      ${fonts}
    }
  }
`;

export const Landing: FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    trackEvent('landing_open');
  }, []);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <Helmet>
        <body className="landing" />
      </Helmet>
      <Wrapper>
        <Drawer isOpen={isDrawerOpen} onDrawerClose={handleDrawerToggle} />
        <Header onDrawerToggle={handleDrawerToggle} />
        <Top />
        <Functions />
        <Features />
        <YouCan>
          <Under />
          {/* <Updates /> */}
          <Footer />
        </YouCan>
      </Wrapper>
    </>
  );
};
