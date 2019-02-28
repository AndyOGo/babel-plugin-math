const isSimpleExpression = (node, t) => {
  t.isLiteral(node) || t.isIdentifier(node);
};

export default isSimpleExpression;
