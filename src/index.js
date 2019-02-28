import maxTransformer from './math/max';

export default function babelPluginMath(babel) {
  return {
    name: "ast-transform", // not required
    visitor: {
      CallExpression(path, { opts = { max = true } = {} } = {}) {
        if (max) {
          maxTransformer(path, babel)
        }
      }
    }
  };
}
