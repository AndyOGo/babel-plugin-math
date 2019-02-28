import max from './math/max';

export default function(babel) {
  return {
    name: "ast-transform", // not required
    visitor: {
      CallExpression(path) {
        max(path, babel)
      }
    }
  };
}
