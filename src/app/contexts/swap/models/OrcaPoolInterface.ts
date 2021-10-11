import { CurveType, PoolConfig } from '../orca-commons';
import TradeablePoolInterface from './TradeablePoolInterface';

export default interface OrcaPoolInterface extends TradeablePoolInterface {
  poolConfig: PoolConfig;
  getCurveType(): CurveType;
}
