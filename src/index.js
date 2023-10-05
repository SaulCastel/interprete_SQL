const parser = require('./parser/query_parser.js')
const genDOT = require('./Graph.js')

const input = '(3 > 4) OR NOT FALSE; 1 % 2 - 3; -3 * -3 + 1000;'
const stmts = parser.parse(input)
console.log(genDOT(stmts))
