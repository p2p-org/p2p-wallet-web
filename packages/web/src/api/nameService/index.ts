import { memoizeWith, toString } from 'ramda';

import { nameSericeUrl } from 'config/constants';

export type LookupResponce = {
  address: string;
  name: string;
  parent: string;
};

export type ResolveUsernameResponce = {
  parent_name: string;
  owner: string;
  class: string;
  name: string;
};

export interface API {
  lookupName: (owner: string | null) => Promise<Array<LookupResponce>>;
  resolveName: (name: string) => Promise<Array<ResolveUsernameResponce>>;
}

export const APIFactory = memoizeWith(toString, (_: any): API => {
  const lookupName = async (owner: string | null): Promise<Array<LookupResponce>> => {
    if (!owner) return [];
    try {
      const res = await fetch(`${nameSericeUrl}/lookup/${owner}`);

      if (!res.ok) {
        throw new Error('lookup username something wrong');
      }

      const result = await res.json();

      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const resolveName = async (name: string): Promise<Array<ResolveUsernameResponce>> => {
    if (!name) return [];
    try {
      const res = await fetch(`${nameSericeUrl}/resolve/${name}`);

      if (res.status === 404) {
        return [];
      }

      const result = await res.json();

      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return {
    lookupName,
    resolveName,
  };
});
