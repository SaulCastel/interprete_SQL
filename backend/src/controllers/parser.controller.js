import parser from '../parser/query_parser.cjs'
import Context from '../interpreter/Context.cjs'
import Database from '../database/Database.js'
import genDOT from '../util/Graph.cjs'

export const interpret = (req, res) => {
    const {input} = req.body
    const stmts = parser.parse(input)
    const global = new Context('Global')
    let state = {
        messages: [],
        database: new Database(),
        queries: []
    }
    for(const stmt of stmts){
        stmt.interpret(global, state)
    }
    genDOT(stmts)
    const output = {
        messages: state.messages,
        queries: state.queries,
    }
    res.status(200).json(output)
}
