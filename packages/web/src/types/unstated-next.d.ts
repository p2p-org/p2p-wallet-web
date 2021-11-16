import 'types/unstated-next';

declare module 'types/unstated-next' {
  export function createContainer<Value, State = void>(
    useHook: (initialState: State) => Value,
  ): Container<Value, State>;
}
