import { set } from 'lodash';

import { GlobalContextService } from './GlobalContextService';

class TestGlobalContextStore extends GlobalContextService {
  // find is a protected method on GlobalContextStore
  // over writing that access level for testing.
  static override Find<T>(key: string): T {
    return GlobalContextService.Find(key);
  }
}

describe('Global Context Object should work as expected', () => {
  test('Global Context should Find an object on global', () => {
    const testString = 'Hello';
    set(global, 'testString', testString);

    const findString = TestGlobalContextStore.Find('testString');
    expect(findString).toBeTruthy();
    expect(findString).toEqual(testString);
  });

  // something is setting global window = true when running test under jest, might be the 'dom'
  // implementation
  // @todo: figure out what is setting global window object here and make it set to undefined...
  test('Global Context Store should create it self and set isSSR to false', () => {
    const gcs = GlobalContextService.Get();
    expect(gcs).toBeTruthy();
    expect(gcs.isSSR).toBeFalsy();
  });
});
