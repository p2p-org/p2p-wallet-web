import { AppDispatch } from 'store';
import { RootState } from 'store/rootReducer';

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState {}

  export function useDispatch<TDispatch = AppDispatch>(): TDispatch;
}
