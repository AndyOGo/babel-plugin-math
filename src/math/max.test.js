// import babel from '@babel/core';
import mathPlugin from '../index';

const babel = require('@babel/core');

const execSource = source => {
  const { code } = babel.transform(`var res = ${source}`, {
    plugins: [mathPlugin],
  });

  // eslint-disable-next-line no-new-func
  return new Function(`
    ${code};
    return res;
  `)();
};

describe('max', () => {
  it('should transform Math.max calls', () => {
    const source = `
      // literal arguments
      Math.max(1, 2);
      Math.max(1, 2, 3);
      Math.max("1", "2");
      Math.max("1", "2", "3");
      Math['max'](1, 2);
      Math['max'](1, 2, 3);
      Math['max']("1", "2");
      Math['max']("1", "2", "3");
      // variable arguments
      Math.max(a, b);
      Math.max(a, b, c);
      Math.max(foo(), bar());
      Math.max(1, 2 + 2, a * b, foo() / bar());
      Math['max'](a, b);
      Math['max'](a, b, c);
      Math['max'](foo(), bar());
      Math['max'](1, 2 + 2, a * b, foo() / bar());
    `;
    const { code } = babel.transform(source, {
      plugins: [mathPlugin],
    });

    expect(code).toMatchSnapshot();
  });

  it('should return the max value', () => {
    expect(execSource('Math.max(1, 5)')).toBe(5);
    expect(execSource('Math.max(5, 1)')).toBe(5);
    expect(execSource('Math.max(1, 2, 3, 4, 5)')).toBe(5);

    expect(execSource('Math.max("1", "5")')).toBe(5);
    expect(execSource('Math.max("5", "1")')).toBe(5);
    expect(execSource('Math.max("1", "20", "3", "4", "5")')).toBe(20);
  });
});
