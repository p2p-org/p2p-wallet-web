function setValue(obj: Object, path: string, value: string) {
  const a = path.split('.');
  let o = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value;
}

const flattenObject = <T>(obj: T, theme = {}, prefix = '') =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '-' : '--';
    if (typeof obj[k] === 'object') {
      Object.assign(acc, flattenObject(obj[k], theme, pre + k));
    } else {
      const keys = (pre + k).replace('--', '').replace(/-/g, '.');
      setValue(theme, keys, `var(${pre + k})`);
      acc[pre + k] = obj[k];
    }
    return { ...acc, theme };
  }, {}) as { theme: T; [k: string]: any; };

export const generate = <T>(tokens: T): {
  theme: T,
  variables: string;
} => {
  const { theme, ...vars } = flattenObject(tokens);
  const variables = Object.keys(vars).reduce((acc, key) => {
    acc += `${key}: ${vars[key]};`;
    return acc;
  }, '');

  return { theme, variables };
};
