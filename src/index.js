import maxTransform from './math/max';

export default function babelPluginMath(babel) {
  return {
    name: 'math', // not required
    visitor: {
      CallExpression(path, { opts: { max = true } = {} } = {}) {
        if (max) {
          maxTransform(path, babel);
        }
      },
    },
  };
}
