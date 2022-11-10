export type Name = {
  address: string;
  parent: string;
  class: string;
  name: string;
};

export type Owner = {
  parent: string;
  owner: string;
  class: string;
  name: string;
};

export interface RequestDataType {
  jsonrpc: '2.0';
  method: string;
  params: Record<string, string>;
  id: 1;
}

export interface RequestResolveDataType extends RequestDataType {
  method: 'resolve_name';
  params: {
    name: string;
  };
}

export interface RequestLookupDataType extends RequestDataType {
  method: 'lookup_name';
  params: {
    owner: string;
  };
}

interface ResponseCommon {
  jsonrpc: '2.0';
  result: Array<unknown>;
  id: 1;
}

export interface ResponseResolve extends ResponseCommon {
  result: Owner[];
}

export interface ResponseLookup extends ResponseCommon {
  result: Name[];
}
