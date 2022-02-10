import type { FunctionComponent } from 'react';
import { forwardRef, Fragment } from 'react';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme, useIsTablet } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Widget } from 'components/common/Widget';
import { Icon } from 'components/ui';

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const BackLink = styled(NavLink)`
  display: flex;
  align-items: center;

  text-decoration: none;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
`;

export const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.secondary};

  &.back {
    width: 24px;
    height: 24px;

    transform: rotate(90deg);
  }
`;

export const Title = styled.div`
  margin-left: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.previous,
  &.notLast {
    color: ${theme.colors.textIcon.secondary};
    font-weight: normal;
  }
`;

type Props = {
  forwardedRef?: React.Ref<HTMLDivElement>;
  icon?: string;
  title: string | string[];
  backTo?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const WidgetPageOriginal: FunctionComponent<Props> = ({
  forwardedRef,
  icon,
  title,
  backTo,
  action,
  children,
  className,
  ...props
}) => {
  const isTable = useIsTablet();

  const renderTitle = () => {
    if (!isTable) {
      return null;
    }

    if (Array.isArray(title)) {
      return (
        <TitleWrapper>
          {title.map((t, i) => {
            const first = i === 0;
            const previous = title.length - 2 === i;
            const notLast = title.length - 1 !== i;

            if (first) {
              return (
                <Fragment key={t}>
                  <BackLink to={backTo}>
                    <IconStyled name="chevron" className="back" />
                    <Title key={t} className={classNames({ notLast })}>
                      {t}
                    </Title>
                  </BackLink>
                  {notLast ? <Title className={classNames({ notLast })}>/</Title> : undefined}
                </Fragment>
              );
            }

            return (
              <Fragment key={t}>
                <Title className={classNames({ notLast })}>{t}</Title>
                {notLast ? <Title className={classNames({ previous })}>/</Title> : undefined}
              </Fragment>
            );
          })}
        </TitleWrapper>
      );
    }

    return (
      <TitleWrapper>
        {icon ? (
          <IconWrapper>
            <IconStyled name={icon} />
          </IconWrapper>
        ) : undefined}
        <Title>{title}</Title>
      </TitleWrapper>
    );
  };

  return (
    <Widget
      ref={forwardedRef}
      title={renderTitle()}
      action={action}
      className={className}
      {...props}
    >
      {children}
    </Widget>
  );
};

export const WidgetPage = forwardRef<HTMLDivElement, Props>(
  (props, ref: React.Ref<HTMLDivElement>) => <WidgetPageOriginal {...props} forwardedRef={ref} />,
);
