// import babel from '@babel/core';
import mathPlugin from '../index';

const babel = require('@babel/core');

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
});
