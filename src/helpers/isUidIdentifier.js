export default function isUidIdentifier(node, reName, t) {
  return t.isIdentifier(node) && reName.test(node.name);
}
