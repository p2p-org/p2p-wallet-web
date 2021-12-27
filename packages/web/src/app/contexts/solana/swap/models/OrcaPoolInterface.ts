import type { CurveType, PoolConfig } from '../orca-commons';
import type TradeablePoolInterface from './TradeablePoolInterface';

export default interface OrcaPoolInterface extends TradeablePoolInterface {
  poolConfig: PoolConfig;
  getCurveType(): CurveType;
}
