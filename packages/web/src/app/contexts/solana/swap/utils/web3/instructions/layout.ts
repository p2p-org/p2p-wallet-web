import * as BufferLayout from 'buffer-layout';

export const uint64 = (property = 'uint64'): BufferLayout.Layout => {
  return BufferLayout.blob(8, property);
};
