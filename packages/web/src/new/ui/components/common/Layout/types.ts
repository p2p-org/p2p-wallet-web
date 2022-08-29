import type * as H from 'history';

export type BreadcrumbType = {
  currentName: string;
  backTo?: string | Partial<H.Location<any>>;
};
