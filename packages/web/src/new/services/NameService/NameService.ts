import axios from 'axios';
import { last } from 'ramda';
import { injectable } from 'tsyringe';

const request = axios.create();

type Name = {
  address?: string;
  name?: string;
  parent?: string;
};

export type Owner = {
  parent_name: string;
  owner: string;
  class: string;
  name: string;
};

interface NameServiceType {
  getName(owner: string): Promise<string | null>;
  getOwners(name: string): Promise<Owner[]>;
  // getOwnerAddress(name: string): Promise<string | null>;
}

// TODO: application scope
@injectable()
export class NameService implements NameServiceType {
  private _endpoint = 'https://solana-fee-relayer.wallet.p2p.org/name_register';
  private _cache: Record<string, string | null> = {};

  constructor() {}
  getName(owner: string): Promise<string | null> {
    if (this._cache[owner]) {
      return Promise.resolve(this._cache[owner] ?? null);
    }

    return this._getNames(owner).then((items) => {
      const names = items.filter((item) => Boolean(item.name));
      const name = last(names)?.name ?? null;
      this._cache[owner] = name;

      return name;
    });
  }

  getOwners(name: string): Promise<Owner[]> {
    return request
      .get<Owner[]>(`${this._endpoint}/resolve/${name}`)
      .then(({ data }) => data)
      .then((result) => {
        for (const record of result) {
          const name = record.name;
          if (name) {
            this._cache[record.owner] = name;
          }
        }

        return result;
      });
  }

  // getOwnerAddress(name: string): Promise<string | null> {
  //   return this._getOwner(name)
  //     .then((item) => item?.owner ?? null)
  //     .catch((err) => {
  //       // TODO: catch only 404
  //       console.error('TODO: catch only 404 - ', err);
  //       return null;
  //     });
  // }

  // isNameAvailable(name: string): Promise<string | null> {
  //   return this.getOwnerAddress(name).then((address) => address ?? null);
  // }

  // private _getOwner(name: string): Promise<Owner | null> {
  //   return request(`${this._endpoint}/${name}`).then(({ data }) => data);
  // }

  private _getNames(owner: string): Promise<Name[]> {
    return request(`${this._endpoint}/lookup/${owner}`).then(({ data }) => data);
  }
}
