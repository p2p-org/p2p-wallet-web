import { AppDispatch } from 'store';
import { RootState } from 'store/rootReducer';

declare module 'react-redux' {
  interface DefaultRootState extends RootState {}

  export function useDispatch<TDispatch = AppDispatch>(): TDispatch;
}
