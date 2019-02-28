import isMathCall from '../helpers/isMathCall';
import isSimpleExpression from '../helpers/isSimpleExpression';

let hit = 0;

function max(babel, path) {
  const { types: t } = babel;
  const { node, scope } = path;
  
  if (!isMathCall(node, "max", t)) {
    return;
  }

  hit++;

  const { arguments: args } = node;
  const { length } = args;
  const isNested = length > 2;
  let lastIntermmediate;
  let finalmax;
  let lastTernary;
  let lastResult;
  const cache = t.variableDeclaration("var", []);
  const { declarations } = cache;

  // loop through all arguments
  for (let index = 1; index < length; index++) {
    const isLast = index === length - 1;
    let result;

    // if more that two args, result of ternary needs to be cached for later reuse
    if (isNested && !isLast) {
      result = scope.generateUidIdentifier("max-intermediate");

      declarations.push(t.variableDeclarator(result));
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
      const leftId = scope.generateUidIdentifier("max-left-arg");

      declarations.push(t.variableDeclarator(leftId, leftArg));

      leftArg = leftId;
    }

    // needs caching if not simple variable or literal
    if (!isRightSimple) {
      const rightId = scope.generateUidIdentifier("max-right-arg");

      declarations.push(t.variableDeclarator(rightId, rightArg));

      rightArg = rightId;
    }

    // build faster ternary expression
    let expression;
    const ternary = t.conditionalExpression(
      t.binaryExpression(">", leftArg, rightArg),
      leftArg,
      rightArg
    );

    // cache previous max comparisons for later reuse
    if (isNested && !isLast) {
      expression = t.assignmentExpression("=", result, ternary);
    }

    // apply cached result from previous run
    if (lastTernary) {
      ternary.consequent = lastResult;
    }

    lastTernary = ternary;
    lastIntermmediate = expression || ternary;
    lastResult = result;
  }

  const replacement = [lastIntermmediate];

  // put declarations before micro optimization
  if (declarations.length) {
    replacement.unshift(cache);
  }

  // update AST
  path.replaceWithMultiple(replacement);
}

export default max;
