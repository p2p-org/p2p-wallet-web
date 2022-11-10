import axios from 'axios';
import { last } from 'ramda';
import { injectable } from 'tsyringe';

import type {
  Name,
  Owner,
  RequestDataType,
  RequestLookupDataType,
  RequestResolveDataType,
  ResponseLookup,
  ResponseResolve,
} from './types';

const request = axios.create();

const RequestBase: RequestDataType = {
  jsonrpc: '2.0',
  method: '',
  params: {},
  id: 1,
};

interface NameServiceType {
  getName(owner: string): Promise<string | null>;
  getOwners(name: string): Promise<Owner[]>;
  // getOwnerAddress(name: string): Promise<string | null>;
}

// TODO: application scope
@injectable()
export class NameService implements NameServiceType {
  private _endpoint = process.env.REACT_APP_NAME_SERVICE_URL!;
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
    const data: RequestResolveDataType = {
      ...RequestBase,
      method: 'resolve_name',
      params: { name },
    };

    return request
      .post<ResponseResolve>(this._endpoint, data)
      .then(({ data }) => data)
      .then((data) => {
        for (const record of data.result) {
          const name = record.name;
          if (name) {
            this._cache[record.owner] = name;
          }
        }

        return data.result;
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
    const data: RequestLookupDataType = {
      ...RequestBase,
      method: 'lookup_name',
      params: { owner },
    };

    return request.post<ResponseLookup>(this._endpoint, data).then(({ data }) => data.result);
  }
}
