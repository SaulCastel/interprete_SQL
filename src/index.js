const parser = require('./parser/query_parser.js')
const genDOT = require('./util/Graph.js')

const input = 'print "hola, que tal?"; print 2+3*4; print "conca" + "tenacion";'
const stmts = parser.parse(input)
console.log(genDOT(stmts))
for(const stmt of stmts){
    stmt.interpret()
}
