import { generate } from '../themes/utils';

const vars = {
  zIndex: {
    bottom: 1,
    middle: 10,
    top: 20,
    modal: 30,
  },
};

export const variables = generate(vars);
