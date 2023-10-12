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
        state.messages.push(String(this.expr.interpret(context))+'\n')
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
            context.set(symbol[0], null, symbol[1])
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
        context.set(this.key, this.expr.interpret(context), this.type)
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
        context.update(this.key, this.expr.interpret(context))
    }
}

class CreateTable extends Stmt{
    constructor(id, tableId, columns){
        super(id)
        this.tableId = tableId
        this.columns = columns
    }

    _genDOT(){}

    interpret(context, state){
        state.database.createTable(this.tableId, this.columns)
    }
}

class AlterTable extends Stmt{
    constructor(id, tableId, action){
        super(id)
        this.tableId = tableId
        this.action = action
    }

    _genDOT(){}

    interpret(context, state){
        state.database.alterTable(this.tableId, this.action)
    }
}

class DropTable extends Stmt{
    constructor(id, tableId){
        super(id)
        this.tableId = tableId
    }

    _genDOT(){}

    interpret(context, state){
        state.database.dropTable(this.tableId)
    }
}

class InsertInto extends Stmt{
    constructor(id, tableId, columns, values){
        super(id)
        this.tableId = tableId
        this.columns = columns
        this.values = values
    }

    _genDOT(){}

    interpret(context, state){
        state.database.insertInto(this.tableId, this.columns, this.values, context)
    }
}

class SelectFrom extends Stmt{
    constructor(id, tableId, selection, condition){
        super(id)
        this.tableId = tableId
        this.selection = selection
        this.condition = condition
    }

    _genDOT(){}

    interpret(context, state){
        state.table = state.database.selectFrom(this.tableId, this.selection, this.condition, context)
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
}
