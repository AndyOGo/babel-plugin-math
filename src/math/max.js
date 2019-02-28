import isMathCall from '../helpers/isMathCall';
import isSimpleExpression from '../helpers/isSimpleExpression';
import coerceToNumber from '../helpers/coerceToNumber';

const reUidName = /mir|mla|mra/;

export default function max(babel, path) {
  const { types: t } = babel;
  const { node, scope } = path;

  if (!isMathCall(node, 'max', t)) {
    return;
  }

  const { arguments: args } = node;
  const { length } = args;
  const isNested = length > 2;
  let lastIntermmediate;
  let lastTernary;
  let lastResultId;
  const cache = t.variableDeclaration('var', []);
  const { declarations } = cache;

  // loop through all arguments
  for (let index = 1; index < length; index++) {
    const isLast = index === length - 1;
    let resultId;

    // if more that two args, result of ternary needs to be cached for later reuse
    if (isNested && !isLast) {
      resultId = scope.generateUidIdentifier('mir'); // max-intermediate-result

      declarations.push(t.variableDeclarator(resultId));
    }

    const leftIndex = index - 1;
    const rightIndex = index;
    let leftArg = args[leftIndex];
    let rightArg = args[rightIndex];
    const isLeftSimple = isSimpleExpression(leftArg, t);
    const isRightSimple = isSimpleExpression(rightArg, t);

    // after first run, reuse previous comparison
    if (lastIntermmediate) {
      leftArg = lastIntermmediate;
    } else if (!isLeftSimple) {
      // needs caching if not simple variable or literal
      const leftId = scope.generateUidIdentifier('mla'); // max-left-arg

      declarations.push(t.variableDeclarator(leftId, coerceToNumber(leftArg, reUidName, t)));

      leftArg = leftId;
    }

    // needs caching if not simple variable or literal
    if (!isRightSimple) {
      const rightId = scope.generateUidIdentifier('mra'); // max-right-arg

      declarations.push(
        t.variableDeclarator(rightId, coerceToNumber(rightArg, reUidName, t))
      );

      rightArg = rightId;
    }

    // make sure to have numeric types as the result
    if (!lastIntermmediate) {
      leftArg = coerceToNumber(leftArg, reUidName, t);
    }
    rightArg = coerceToNumber(rightArg, reUidName, t);

    // build faster ternary expression
    let expression;
    const ternary = t.conditionalExpression(
      t.binaryExpression('>', leftArg, rightArg),
      leftArg,
      rightArg
    );

    // cache previous max comparisons for later reuse
    if (isNested && !isLast) {
      expression = t.assignmentExpression('=', resultId, ternary);
    }

    // apply cached result from previous run
    if (lastTernary) {
      ternary.consequent = lastResultId;
    }

    lastTernary = ternary;
    lastIntermmediate = expression || ternary;
    lastResultId = resultId;
  }

  const replacement = [lastIntermmediate];

  // put declarations before micro optimization
  if (declarations.length) {
    replacement.unshift(cache);
  }

  // update AST
  path.replaceWithMultiple(replacement);
}
