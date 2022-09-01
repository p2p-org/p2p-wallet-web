import { Type } from 'class-transformer';

import { OrcaInfo } from './OrcaInfo';

export class OrcaInfoResponse {
  @Type(() => OrcaInfo)
  // @ts-ignore
  value: OrcaInfo;

  // constructor({ value }: { value: OrcaInfo }) {
  //   this.value = value;
  // }
}
