const Context = require('./Context.cjs')
const Binary = require('./Expression.cjs').Binary
const markdownTable = require('../util/markdownTable/markdownTable.cjs')

class Stmt{
    constructor(id, tokens, callables=[], root='Statement'){
        this.id = id
        this.tokens = tokens
        this.tokens.push(';')
        this.callabes = callables
        this.root = root
    }

    interpret(){}

    _genDOT(){
        let dot = `\t"${this.id}"[label="${this.root}"]\n`
        for(const token in this.tokens){
            if(token[0] === '$'){
                const child = this.callabes[Number(tokens[1])]
                dot += child._genDOT()
                dot += `\t"${this.id}" -- "${child.id}"\n`
            }
            else{
                const node = this.id + token
                dot += `\t"${node}"[label="${token}"]\n`
                dot += `\t"${this.id}" -- "${node}"\n`
            }
        }
        return dot
    }

    appendList(stmts, suffix){
        let dot = ''
        dot += stmts[0]._genDOT()
        dot += `\t"${this.id}${suffix}0"[label="BlockStmts0"]\n`
        dot += `\t"${this.id}${suffix}0" -- "stmt${stmts[0].id}"\n`
        for(let i = 1; i < stmts.length-1; i++){
            dot += stmts[i]._genDOT()
            dot += `\t"${this.id}${suffix}${i-1}" -- "stmt${stmts[i].id}"\n`
            dot += `\t"${this.id}${suffix}${i}"[label="BlockStmts${i}"]\n`
            dot += `\t"${this.id}${suffix}${i}" -- "${this.id}${suffix}${i-1}"\n`
        }
        const length = stmts.length-1
        dot += stmts[length]._genDOT()
        dot += `\t"${this.id}${suffix}${length-1}" -- "stmt${stmts[length].id}"\n`
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
        const expr = this.expr.interpret(context)
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
        const expr = this.expr.interpret(context)
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
        const expr = this.expr.interpret(context)
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
                '(',
                ...values.map(val => val.toString()),
                ')'
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
        super(
            id,
            [
                'SELECT',
                ...selection.map(expr => expr.toString()),
                'FROM',
                tableID,
            ]
        )
        if(condition){
            this.tokens.push('WHERE')
            this.tokens.push('$0')
            this.callabes.push(condition)
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
        super(id)
        this.selection = selection
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="SELECT"]\n`
        dot += `\t"${this.id}expr"[label="Expression(s)"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}expr"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        const result = {
            header: [],
            records: []
        }
        const record = []
        for(const expr of this.selection){
            const value = expr[0].interpret(context)
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
        super(id)
        this.tableID = tableID
        this.selection = selection
        this.condition = condition
    }

    _genDOT(){
        let dot = ''
        dot += this.condition._genDOT()
        dot += `\t"${this.id}"[label="UPDATE"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"${this.id}set"[label="SET"]\n`
        dot += `\t"${this.id}selection"[label="Selection"]\n`
        dot += `\t"${this.id}where"[label="WHERE"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}set"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}selection"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}where"\n`
        dot += `\t"stmt${this.id}" -- "${this.condition.id}"\n`
        dot += this.appendParent()
        return dot
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
        super(id)
        this.tableID = tableID
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="TRUNCATE"]\n`
        dot += `\t"${this.id}table"[label="TABLE"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}table"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        state.database.truncateTable(this.tableID)
    }
}

class DeleteFrom extends Stmt{
    constructor(id, tableID, condition){
        super(id)
        this.tableID = tableID
        this.condition = condition
    }

    _genDOT(){
        let dot = ''
        dot += this.condition._genDOT()
        dot += `\t"${this.id}"[label="DELETE"]\n`
        dot += `\t"${this.id}from"[label="FROM"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"${this.id}where"[label="WHERE"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}from"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}where"\n`
        dot += `\t"stmt${this.id}" -- "${this.condition.id}"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        state.database.deleteFrom(this.tableID, this.condition, context)
    }
}

class Block extends Stmt{
    constructor(id, stmts){
        super(id)
        this.stmts = stmts
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}begin"[label="BEGIN"]\n`
        dot += `\t"${this.id}end"[label="END"]\n`
        dot += this.appendList(this.stmts, 'code')
        dot += `\t"stmt${this.id}" -- "${this.id}begin"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}code${this.stmts.length-2}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}end"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state, createContext=true){
        if(createContext){
            context = new Context(`Block ${state.contextCount++}`, context)
        }
        for(const stmt of this.stmts){
            stmt.interpret(context, state)
            if(state.flag){
                break
            }
        }
    }
}

class Break extends Stmt{
    constructor(id){
        super(id)
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="BREAK"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        state.flag = 'BREAK'
    }
}

class Continue extends Stmt{
    constructor(id){
        super(id)
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="CONTINUE"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        state.flag = 'CONTINUE'
    }
}

class For extends Stmt{
    constructor(id, iterator, lowerLimit, upperLimit, block){
        super(id)
        this.iterator = iterator
        this.lowerLimit = Number(lowerLimit)
        this.upperLimit = Number(upperLimit)
        this.block = block
    }

    _genDOT(){
        let dot = ''
        dot += this.block._genDOT()
        dot += `\t"${this.id}"[label="FOR"]\n`
        dot += `\t"${this.id}i"[label="${this.iterator.toString()}"]\n`
        dot += `\t"${this.id}in"[label="IN"]\n`
        dot += `\t"${this.id}lower"[label="${this.lowerLimit}"]\n`
        dot += `\t"${this.id}.."[label=".."]\n`
        dot += `\t"${this.id}upper"[label="${this.upperLimit}"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}in"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}lower"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}.."\n`
        dot += `\t"stmt${this.id}" -- "${this.id}upper"\n`
        dot += `\t"stmt${this.id}" -- "stmt${this.block.id}"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        const local = new Context(`Block ${state.contextCount++}`, context)
        local.set(this.iterator, 'INT', this.lowerLimit)
        for(let i = this.lowerLimit; i <= this.upperLimit; i++){
            if(!state.flag){
                this.block.interpret(local, state, false)
                local.set(this.iterator,'INT', i+1)
            }
            else if(state.flag === 'BREAK'){
                state.flag = null
                break
            }
            else if(state.flag === 'CONTINUE'){
                state.flag = null
                continue
            }
        }
        state.flag = null
    }
}

class While extends Stmt{
    constructor(id, condition, block){
        super(id)
        this.condition = condition
        this.block = block
    }

    _genDOT(){
        let dot = ''
        dot += this.condition._genDOT()
        dot += this.block._genDOT()
        dot += `\t"${this.id}"[label="WHILE"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.condition.id}"\n`
        dot += `\t"stmt${this.id}" -- "stmt${this.block.id}"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        const local = new Context(`Block ${state.contextCount++}`, context)
        let result = this.condition.interpret(local).valueOf()
        while(result){
            if(!state.flag){
                this.block.interpret(local, state, false)
                result = this.condition.interpret(local).valueOf()
            }
            else if(state.flag === 'BREAK'){
                state.flag = null
                break
            }
            else if(state.flag === 'CONTINUE'){
                state.flag = null
                continue
            }
        }
        state.flag = null
    }
}

class If extends Stmt{
    constructor(id, condition, stmts, elseBlock){
        super(id)
        this.condition = condition
        this.stmts = stmts
        this.elseBlock = elseBlock
    }

    _genDOT(){
        let dot = ''
        dot += this.condition._genDOT()
        dot += this.appendList(this.stmts, 'code')
        dot += `\t"${this.id}"[label="IF"]\n`
        dot += `\t"${this.id}then"[label="THEN"]\n`
        dot += `\t"${this.id}end"[label="END IF"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.condition.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}then"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}code${this.stmts.length-1}"\n`
        if(this.elseBlock){
            dot += this.appendList(this.elseBlock, 'else')
            dot += `\t"${this.id}elseBlock"[label="ELSE"]\n`
            dot += `\t"stmt${this.id}" -- "${this.id}elseBlock"\n`
            dot += `\t"stmt${this.id}" -- "${this.id}else${this.elseBlock.length-1}"\n`
        }
        dot += `\t"stmt${this.id}" -- "${this.id}end"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        const result = this.condition.interpret(context).valueOf()
        if(result){
            const local = new Context(`Block ${state.contextCount++}`, context)
            for(const stmt of this.stmts){
                stmt.interpret(local, state)
            }
        }
        else{
            if(this.elseBlock){
                const local = new Context(`Block ${state.contextCount++}`, context)
                for(const stmt of this.elseBlock){
                    stmt.interpret(local, state)
                }
            }
        }
    }
}

class Case extends Stmt{
    constructor(id, expr, cases, defaultCase, alias){
        super(id)
        this.expr = expr
        this.cases = cases
        this.defaultCase = defaultCase
        this.alias = alias
    }

    _genDOT(){
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="CASE"]\n`
        dot += `\t"${this.id}cases"[label="Case(s)"]\n`
        dot += `\t"${this.id}default"[label="DefaultCase"]\n`
        dot += `\t"${this.id}end"[label="END"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.expr.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}cases"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}default"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}end"\n`
        if(this.alias){
            dot += `\t"${this.id}alias"[label="${this.alias}"]\n`
            dot += `\t"stmt${this.id}" -- "${this.id}alias"\n`
        }
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        let returnExpr = this.defaultCase.interpret(context)
        for(const c of this.cases){
            if(c[0] instanceof Binary){
                const result = c[0].interpret(context).valueOf()
                if(result){
                    returnExpr = c[1].interpret(context)
                    break
                }
            }
            else{
                const result = new Binary(null, this.expr, '=', c[0])
                    .interpret(context).valueOf()
                if(result){
                    returnExpr = c[1].interpret(context)
                    break
                }
            }
        }
        if(this.alias){
            state.messages.push(`${this.alias} -> `+String(returnExpr)+'\n')
        }
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
    Case,
}
