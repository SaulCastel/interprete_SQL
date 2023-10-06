import parser from '../parser/query_parser.cjs'

export const interpret = (req, res) => {
    const {input} = req.body
    const stmts = parser.parse(input)
    for(const stmt of stmts){
        stmt.interpret()
    }

    res.status(200).json({
        message: 'Entrada interpretada'
    })
}
