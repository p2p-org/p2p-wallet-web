import { indexOf, update } from 'ramda';

import { HasEqual } from 'utils/types';

/**
 * Given an entity and an array of entities
 * Find the location of the entity in the array, and replace it.
 * This only works with entities with equals() methods, whose properties
 * can change, without changing the equals result.
 * @param entity
 * @param array
 */
export const updateEntityArray = <T extends HasEqual<T>>(entity: T, array: Array<T>): Array<T> =>
  update(indexOf(entity, array), entity, array);
