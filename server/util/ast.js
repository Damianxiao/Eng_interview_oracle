import {
    parse,
    re
} from 'mathjs';

export function parseExpression(array, expression) {
    const pattern = /\[(\d+)\]/g;
    const replacedExpression = expression.replace(pattern, (match, p1) => array[parseInt(p1, 10)]);
    // console.log(JSON.stringify(parse(replacedExpression), null, 2))
    const ast = parseAst(parse(replacedExpression), array);
    const result = {
        numbers: array,
        ast: ast
    };

    return result;
}

export function parseAst(node, array) {
    if (node.isOperatorNode) {
        // console.log(node.fn + node.op)
        if (node.fn === "unaryMinus" && node.op === "-") {
            return {
                type: "number",
                value: (-1) * node.args[0].value
            }
        }
        return {
            type: "operation",
            value: node.op,
            left: parseAst(node.args[0], array),
            right: parseAst(node.args[1], array)
        };
    } else if (node.isParenthesisNode) {
        return parseAst(node.content, array);
    } else if (node.isConstantNode) {
        return {
            type: "number",
            value: node.value
        };
    }
}

