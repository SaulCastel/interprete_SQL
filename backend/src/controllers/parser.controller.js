import parser from '../parser/query_parser.cjs'
import Context from '../interpreter/Context.cjs'
import Database from '../database/Database.js'

export const interpret = (req, res) => {
    const {input} = req.body
    const stmts = parser.parse(input)
    const global = new Context('Global')
    let state = {
        messages: [],
        database: new Database()
    }
    for(const stmt of stmts){
        stmt.interpret(global, state)
    }
    const output = {
        messages: state.messages
    }
    res.status(200).json(output)
}
