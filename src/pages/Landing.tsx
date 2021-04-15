import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Features } from 'components/pages/landing/Features/Features';
import { Footer } from 'components/pages/landing/Footer';
import { Functions } from 'components/pages/landing/Functions';
import { Header } from 'components/pages/landing/Header';
import { fonts } from 'components/pages/landing/styles/fonts';
import { Top } from 'components/pages/landing/Top';
import { Under } from 'components/pages/landing/Under';
import { Updates } from 'components/pages/landing/Updates';
import { YouCan } from 'components/pages/landing/YouCan/YouCan';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  background: #161616;

  ${fonts}
`;

export const Landing: FC = () => {
  return (
    <Wrapper>
      <Header />
      <Top />
      <Functions />
      <Features />
      <YouCan>
        <Under />
        <Updates />
        <Footer />
      </YouCan>
    </Wrapper>
  );
};
