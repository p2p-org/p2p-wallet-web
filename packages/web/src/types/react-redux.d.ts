import type { AppDispatch } from 'store';
import type { RootState } from 'store/rootReducer';

declare module '@types/react-redux' {
  interface DefaultRootState extends RootState {}

  export function useDispatch<TDispatch = AppDispatch>(): TDispatch;
}
