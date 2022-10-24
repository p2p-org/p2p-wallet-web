import { autorun, set, toJS } from 'mobx';

export function makeLocalStorage<T>(_this: { fromJSON(json: T): T }, name: string) {
  const storedJson = localStorage.getItem(name);
  if (storedJson) {
    const json = JSON.parse(storedJson);
    set(_this, _this.fromJSON(json));
  }
  autorun(() => {
    const value = toJS(_this);
    localStorage.setItem(name, JSON.stringify(value));
  });
}
