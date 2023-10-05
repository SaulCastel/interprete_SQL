const parser = require('./parser/query_parser.js')
const genDOT = require('./util/Graph.js')

const input = '"hola" + "adios"; "\\"como" != "\\\\alo\\\\";'
const stmts = parser.parse(input)
console.log(genDOT(stmts))
