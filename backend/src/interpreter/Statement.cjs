class Stmt{
    constructor(id){
        this.id = id
    }
    interpret(){}
    _genDOT(){}
}

class Print extends Stmt{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    _genDOT(){
        let dot = `\t"stmt${this.id}"[label="Stmt"]\n`
        dot += `\t"${this.id}"[label="Print"]\n`
        dot += this.expr._genDOT()
        dot += `\t"${this.id};"[label=";"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.expr.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id};"\n`
        return dot
    }

    interpret(context, state){
        const expr = this.expr.interpret(context)
        state.messages.push(String(expr)+'\n')
    }
}

class Declare extends Stmt{
    constructor(id, symbols){
        super(id)
        this.symbols = symbols
    }

    _genDOT(){
    }

    interpret(context, state){
        for(const symbol of this.symbols){
            context.set(symbol[0], symbol[1], null)
        }
    }
}

class DeclareDefault extends Stmt{
    constructor(id, key, type, expr){
        super(id)
        this.key = key
        this.type = type
        this.expr = expr
    }

    _genDOT(){
    }

    interpret(context, state){
        const expr = this.expr.interpret(context)
        context.set(this.key, this.type, expr)
    }
}

class Set extends Stmt{
    constructor(id, key, expr){
        super(id)
        this.key = key
        this.expr = expr
    }

    _genDOT(){
    }

    interpret(context, state){
        const expr = this.expr.interpret(context)
        context.update(this.key, expr)
    }
}

class CreateTable extends Stmt{
    constructor(id, tableID, columns){
        super(id)
        this.tableID = tableID
        this.columns = columns
    }

    _genDOT(){}

    interpret(context, state){
        state.database.createTable(this.tableID, this.columns)
    }
}

class AlterTable extends Stmt{
    constructor(id, tableID, action){
        super(id)
        this.tableID = tableID
        this.action = action
    }

    _genDOT(){}

    interpret(context, state){
        state.database.alterTable(this.tableID, this.action)
    }
}

class DropTable extends Stmt{
    constructor(id, tableID){
        super(id)
        this.tableID = tableID
    }

    _genDOT(){}

    interpret(context, state){
        state.database.dropTable(this.tableID)
    }
}

class InsertInto extends Stmt{
    constructor(id, tableID, columns, values){
        super(id)
        this.tableID = tableID
        this.columns = columns
        this.values = values
    }

    _genDOT(){}

    interpret(context, state){
        state.database.insertInto(this.tableID, this.columns, this.values, context)
    }
}

class SelectFrom extends Stmt{
    constructor(id, tableID, selection, condition){
        super(id)
        this.tableID = tableID
        this.selection = selection
        this.condition = condition
    }

    _genDOT(){}

    interpret(context, state){
        const result = state.database.selectFrom(
            this.tableID,
            this.selection,
            this.condition, 
            context
        )
        state.messages.push(`${result.records.length} registro(s) seleccionado(s)\n`)
        state.queries.push(result)
    }
}

class Select extends Stmt{
    constructor(id, selection){
        super(id)
        this.selection = selection
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
        state.queries.push(result)
    }
}

class UpdateTable extends Stmt{
    constructor(id, tableID, selection, condition){
        super(id)
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
        super(id)
        this.tableID = tableID
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

    interpret(context, state){
        state.database.deleteFrom(this.tableID, this.condition, context)
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
}
