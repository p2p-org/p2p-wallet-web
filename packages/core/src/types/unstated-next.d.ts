import type { Container } from 'unstated-next';

declare module 'unstated-next' {
  export function createContainer<Value, State = void>(
    useHook: (initialState: State) => Value,
  ): Container<Value, State>;
}
