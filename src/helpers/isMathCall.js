const isMathCall = (node, methodName, t) => {
  if (
    !methodName ||
    !t.isCallExpression(node) ||
    !t.isMemberExpression(node.callee) ||
    !t.isIdentifier(node.callee.object, { name: "Math" }) ||
    (!t.isIdentifier(node.callee.property, { name: methodName }) &&
      !t.isStringLiteral(node.callee.property, { value: methodName }))
  ) {
    return false;
  }
  return true;
};
