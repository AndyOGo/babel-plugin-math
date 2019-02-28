export default function isSimpleExpression(node, t) {
  return t.isLiteral(node) || t.isIdentifier(node);
}
