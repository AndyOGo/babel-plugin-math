import isUidIdentifier from './isUidIdentifier';

export default function coerceToNumber(node, reName, t) {
  if (!t.isNumberLiteral(node) && !t.isUnaryExpression(node) && !isUidIdentifier(node, reName, t)) {
    return t.unaryExpression('+', node);
  }

  return node;
}
