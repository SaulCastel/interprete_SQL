const Context = require('./Context.cjs')
const Binary = require('./Expression.cjs').Binary
const markdownTable = require('../util/markdownTable/markdownTable.cjs')
const {CONTINUE, BREAK} = require('./Types.cjs')

class Stmt{
    constructor(id, tokens=[], callables=[], root='Statement'){
        this.id = id
        this.tokens = tokens
        this.callables = callables
        this.root = root
    }

    interpret(){}

    _genDOT(){
        let dot = `\t"${this.id}"[label="${this.root}"]\n`
        for(const token of this.tokens){
            if(token[0] === '$'){
                const child = this.callables[Number(token[1])]
                dot += child._genDOT()
                if(child instanceof ASTList){
                    const length = child.stmts.length
                    if(length < 3){
                        dot += `\t"${this.id}" -- "${child.id}g0"\n`
                    }
                    else{
                        dot += `\t"${this.id}" -- "${child.id}g${length-2}"\n`
                    }
                }
                else{
                    dot += `\t"${this.id}" -- "${child.id}"\n`
                }
            }
            else{
                const node = this.id + token
                dot += `\t"${node}"[label="${token}"]\n`
                dot += `\t"${this.id}" -- "${node}"\n`
            }
        }
        return dot
    }
}

class ASTList{
    constructor(id, stmts){
        this.id = id
        this.stmts = stmts
    }

    _genDOT(){
        let dot = ''
        if(this.stmts.length < 3){
            dot += `\t"${this.id}g0"[label="BlockStmts"]\n`
            for(let i = 0; i < this.stmts.length; i++){
                dot += this.stmts[i]._genDOT()
                dot += `\t"${this.id}g0" -- "${this.stmts[i].id}"\n`
            }
        }
        else{
            dot += this.stmts[0]._genDOT()
            dot += `\t"${this.id}g0"[label="BlockStmts0"]\n`
            dot += `\t"${this.id}g0" -- "${this.stmts[0].id}"\n`
            const length = this.stmts.length-1
            for(let i = 1; i < length; i++){
                dot += this.stmts[i]._genDOT()
                dot += `\t"${this.id}g${i-1}" -- "${this.stmts[i].id}"\n`
                dot += `\t"${this.id}g${i}"[label="BlockStmts${i}"]\n`
                dot += `\t"${this.id}g${i}" -- "${this.id}g${i-1}"\n`
            }
            dot += this.stmts[length]._genDOT()
            dot += `\t"${this.id}g${length-1}" -- "${this.stmts[length].id}"\n`
        }
        return dot
    }
}

class Print extends Stmt{
    constructor(id, expr){
        super(
            id,
            ['PRINT', '$0'],
            [expr]
        )
        this.expr = expr
    }

    interpret(context, state){
        const expr = this.expr.interpret(context, state)
        state.messages.push(String(expr)+'\n')
    }
}

class Declare extends Stmt{
    constructor(id, symbols){
        super(
            id,
            [
                'DECLARE',
                ...symbols.map(symbol => `@${symbol[0]} ${symbol[1]}`)
            ]
        )
        this.symbols = symbols
    }

    interpret(context, state){
        for(const symbol of this.symbols){
            context.set(symbol[0], symbol[1], null)
        }
    }
}

class DeclareDefault extends Stmt{
    constructor(id, key, type, expr){
        super(
            id,
            ['DECLARE', `@${key}`, type, 'DEFAULT', '$0'],
            [expr]
        )
        this.key = key
        this.type = type
        this.expr = expr
    }

    interpret(context, state){
        const expr = this.expr.interpret(context, state)
        context.set(this.key, this.type, expr)
    }
}

class Set extends Stmt{
    constructor(id, key, expr){
        super(
            id,
            ['SET', `@${key}`, '=', '$0'],
            [expr]
        )
        this.key = key
        this.expr = expr
    }

    interpret(context, state){
        const expr = this.expr.interpret(context, state)
        context.set(this.key, expr.type, expr)
    }
}

class CreateTable extends Stmt{
    constructor(id, tableID, columns){
        super(
            id,
            [
                'CREATE',
                'TABLE',
                tableID,
                '(',
                ...columns.map(col => `${col[0]} ${col[1]}`),
                ')'
            ]
        )
        this.tableID = tableID
        this.columns = columns
    }

    interpret(context, state){
        state.database.createTable(this.tableID, this.columns)
    }
}

class AlterTable extends Stmt{
    constructor(id, tableID, action){
        super(
            id,
            ['ALTER', 'TABLE', action[0]]
        )
        this.tableID = tableID
        this.action = action
    }

    interpret(context, state){
        state.database.alterTable(this.tableID, this.action)
    }
}

class DropTable extends Stmt{
    constructor(id, tableID){
        super(
            id,
            ['DROP', 'TABLE', tableID]
        )
        this.tableID = tableID
    }

    interpret(context, state){
        state.database.dropTable(this.tableID)
    }
}

class InsertInto extends Stmt{
    constructor(id, tableID, columns, values){
        super(
            id,
            [
                'INSERT',
                'INTO',
                tableID,
                '(',
                ...columns,
                ')',
                'VALUES',
                ...values.map(val => val.toString())
            ]
        )
        this.tableID = tableID
        this.columns = columns
        this.values = values
    }

    interpret(context, state){
        state.database.insertInto(this.tableID, this.columns, this.values, context)
    }
}

class SelectFrom extends Stmt{
    constructor(id, tableID, selection, condition){
        const columns = selection === '*' ? ['*'] : selection.map(expr => expr[0].toString())
        super(
            id,
            [
                'SELECT',
                ...columns,
                'FROM',
                tableID,
            ]
        )
        if(condition){
            this.tokens.push('WHERE')
            this.tokens.push('$0')
            this.callables.push(condition)
        }
        this.tableID = tableID
        this.selection = selection
        this.condition = condition
    }

    interpret(context, state){
        const result = state.database.selectFrom(
            this.tableID,
            this.selection,
            this.condition, 
            context
        )
        state.messages.push(`${result.records.length} registro(s) seleccionado(s)\n`)
        state.messages.push(`\n${markdownTable([result.header, ...result.records])}\n\n`)
    }
}

class Select extends Stmt{
    constructor(id, selection){
        super(
            id,
            ['SELECT', ...selection.map(expr => expr.toString())]
        )
        this.selection = selection
    }

    interpret(context, state){
        const result = {
            header: [],
            records: []
        }
        const record = []
        for(const expr of this.selection){
            const value = expr[0].interpret(context, state)
            record.push(value.toString())
            const alias = expr[1]
            if(alias){
                result.header.push(alias)
            }
            else{
                result.header.push(expr[0].toString())
            }
        }
        result.records.push(record)
        state.messages.push(`\n${markdownTable([result.header, ...result.records])}\n\n`)
    }
}

class UpdateTable extends Stmt{
    constructor(id, tableID, selection, condition){
        super(
            id,
            [
                'UPDATE',
                'TABLE',
                tableID,
                'SET',
                ...selection.map(col => `${col[0]} = ${col[1]}`),
                'WHERE',
                '$0'
            ],
            [condition]
        )
        this.tableID = tableID
        this.selection = selection
        this.condition = condition
    }

    interpret(context, state){
        state.database.updateTable(
            this.tableID,
            this.selection,
            this.condition,
            context
        )
    }
}

class TruncateTable extends Stmt{
    constructor(id, tableID){
        super(
            id,
            ['TRUNCATE', 'TABLE', tableID]
        )
        this.tableID = tableID
    }

    interpret(context, state){
        state.database.truncateTable(this.tableID)
    }
}

class DeleteFrom extends Stmt{
    constructor(id, tableID, condition){
        super(
            id,
            ['DELETE', 'FROM', tableID, 'WHERE', '$0'],
            [condition]
        )
        this.tableID = tableID
        this.condition = condition
    }

    interpret(context, state){
        state.database.deleteFrom(this.tableID, this.condition, context)
    }
}

class Block extends Stmt{
    constructor(id, stmts){
        super(
            id,
            ['BEGIN', '$0', 'END'],
            [new ASTList(id, stmts)],
            'Block'
        )
        this.stmts = stmts
    }

    interpret(context, state, createContext=true){
        if(createContext){
            context = new Context('Block', context)
        }
        for(const stmt of this.stmts){
            const returnExpr = stmt.interpret(context, state)
            if(returnExpr){
                return returnExpr
            }
        }
    }
}

class Break extends Stmt{
    constructor(id){
        super(
            id,
            ['BREAK']
        )
    }

    interpret(context, state){
        return new BREAK('BREAK')
    }
}

class Continue extends Stmt{
    constructor(id){
        super(
            id,
            ['CONTINUE']
        )
    }

    interpret(context, state){
        return new CONTINUE('CONTINUE')
    }
}

class For extends Stmt{
    constructor(id, iterator, lowerLimit, upperLimit, block){
        super(
            id,
            ['FOR', iterator, 'IN', lowerLimit, '..', upperLimit, '$0'],
            [block]
        )
        this.iterator = iterator
        this.lowerLimit = Number(lowerLimit)
        this.upperLimit = Number(upperLimit)
        this.block = block
    }

    interpret(context, state){
        const local = new Context('Block', context)
        for(let i = this.lowerLimit; i <= this.upperLimit; i++){
            local.set(this.iterator,'INT', i)
            const returnExpr = this.block.interpret(local, state, false)
            if(!returnExpr){
                continue
            }
            else if(returnExpr.type === 'BREAK'){
                break
            }
            else if(returnExpr.type === 'CONTINUE'){
                continue
            }
            else{
                return returnExpr
            }
        }
    }
}

class While extends Stmt{
    constructor(id, condition, block){
        super(
            id,
            ['WHILE', '$0', '$1'],
            [condition, block]
        )
        this.condition = condition
        this.block = block
    }

    interpret(context, state){
        const local = new Context('Block', context)
        let result = this.condition.interpret(local).valueOf()
        while(result){
            const returnExpr = this.block.interpret(local, state, false)
            if(!returnExpr){
                result = this.condition.interpret(local).valueOf()
            }
            else if(returnExpr.type === 'BREAK'){
                break
            }
            else if(returnExpr.type === 'CONTINUE'){
                result = this.condition.interpret(local).valueOf()
            }
            else{
                return returnExpr
            }
        }
    }
}

class If extends Stmt{
    constructor(id, condition, stmts, elseBlock){
        super(
            id,
            ['IF', '$0', 'THEN', '$1'],
            [condition, new ASTList(id, stmts)]
        )
        if(elseBlock){
            this.tokens.push('$2')
            this.callables.push(elseBlock)
        }
        this.condition = condition
        this.stmts = stmts
        this.elseBlock = elseBlock
    }

    interpret(context, state){
        const result = this.condition.interpret(context, state).valueOf()
        if(result){
            const local = new Context('IfBlock', context)
            for(const stmt of this.stmts){
                const returnExpr = stmt.interpret(local, state)
                if(returnExpr){
                    return returnExpr
                }
            }
        }
        else if(this.elseBlock){
            const local = new Context('ElseBlock', context)
            return this.elseBlock.interpret(local, state)
        }
    }
}

class Else extends Stmt{
    constructor(id, stmts){
        super(
            id,
            ['ELSE', '$0'],
            [new ASTList(id, stmts)]
        )
        this.stmts = stmts
    }

    interpret(context, state){
        for(const stmt of this.stmts){
            const returnExpr = stmt.interpret(context, state)
            if(returnExpr){
                return returnExpr
            }
        }
    }
}

class Case extends Stmt{
    constructor(id, expr, cases, defaultCase, alias){
        super(
            id,
            [
                'CASE',
                '$0',
                ...cases.map(c => `WHEN ${c[0]} THEN ${c[1]}`),
                `DEFAULT`,
                defaultCase.toString()
            ],
            [expr]
        )
        if(alias){
            this.tokens.push('AS')
            this.tokens.push(alias)
        }
        this.expr = expr
        this.cases = cases
        this.defaultCase = defaultCase
        this.alias = alias
    }

    interpret(context, state){
        let returnExpr = this.defaultCase.interpret(context, state)
        for(const c of this.cases){
            if(c[0] instanceof Binary){
                const result = c[0].interpret(context, state).valueOf()
                if(result){
                    returnExpr = c[1].interpret(context, state)
                    break
                }
            }
            else{
                const result = new Binary(null, this.expr, '=', c[0])
                    .interpret(context, state).valueOf()
                if(result){
                    returnExpr = c[1].interpret(context, state)
                    break
                }
            }
        }
        if(this.alias){
            state.messages.push(`${this.alias} -> `+String(returnExpr)+'\n')
        }
    }
}

class CreateProc extends Stmt{
    constructor(id, name, block, parameters=[]){
        super(
            id,
            [
                'CREATE', 'PROCEDURE', name,
                ...parameters.map(param => `@${param[0]} ${param[1]}`),
                'AS', '$0'
            ],
            [block]
        )
        this.name = name
        this.block = block
        this.parameters = parameters
    }

    interpret(context, state){
        context.set(this.name, 'PROC', {parameters: this.parameters, block: this.block})
    }
}

class Call extends Stmt{
    constructor(id, name, args=[]){
        super(
            id,
            ['CALL', name, '(', ...args.map(arg => arg.toString()), ')']
        )
        this.name = name
        this.arguments = args
    }

    interpret(context, state){
        const proc = context.get(this.name).valueOf()
        const local = new Context(`PROC ${this.name}`, null)
        for(let i = 0; i < this.arguments.length; i++){
            const value = this.arguments[i].interpret(context, state)
            local.set(proc.parameters[i][0], proc.parameters[i][1], value)
        }
        local.prev = context
        proc.block.interpret(local, state, false)
    }
}

class CreateFunc extends Stmt{
    constructor(id, name, parameters, returnType, block){
        super(
            id,
            [
                'CREATE', 'FUNCTION', name, '(',
                ...parameters.map(param => `@${param[0]} ${param[1]}`),
                ')', 'RETURNS', returnType, '$0'
            ],
            [block]
        )
        this.name = name
        this.parameters = parameters
        this.returnType = returnType
        this.block = block
    }

    interpret(context, state){
        context.set(
            this.name,
            'FUNC',
            {
                parameters: this.parameters,
                returnType: this.returnType,
                block: this.block
            }
        )
    }
}

class Return extends Stmt{
    constructor(id, expr){
        super(
            id,
            ['RETURN', '$0'],
            [expr]
        )
        this.expr = expr
    }

    interpret(context, state){
        const expr = this.expr.interpret(context, state)
        return expr
    }
}

module.exports = {
    Print,
    Declare,
    DeclareDefault,
    Set,
    CreateTable,
    AlterTable,
    DropTable,
    InsertInto,
    SelectFrom,
    Select,
    UpdateTable,
    TruncateTable,
    DeleteFrom,
    Block,
    For,
    While,
    Break,
    Continue,
    If,
    Else,
    Case,
    CreateProc,
    Call,
    CreateFunc,
    Return,
}
