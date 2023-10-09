import parser from '../parser/query_parser.cjs'
import Context from '../interpreter/Context.cjs'

export const interpret = (req, res) => {
    const {input} = req.body
    const stmts = parser.parse(input)
    const global = new Context('Global')
    let output = {
        messages: [],
        //TODO: agregar tablas
    }
    for(const stmt of stmts){
        stmt.interpret(global, output)
    }

    res.status(200).json(output)
}
