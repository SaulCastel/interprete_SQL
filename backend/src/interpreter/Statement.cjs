class Stmt{
    constructor(id){
        this.id = id
    }
    interpret(){}
    _genDOT(){}
    appendParent(){
        let dot = `\t"stmt${this.id}" -- "${this.id};"\n`
        dot += `\t"stmt${this.id}"[label="Statement"]\n`
        dot += `\t"${this.id};"[label=";"]\n`
        return dot
    }
}

class Print extends Stmt{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    _genDOT(){
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="PRINT"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.expr.id}"\n`
        dot += this.appendParent()
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
        let dot = ''
        dot += `\t"${this.id}"[label="DECLARE"]\n`
        dot += `\t"${this.id}list"[label="Variable(s)"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}list"\n`
        dot += this.appendParent()
        return dot
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
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="DECLARE"]\n`
        dot += `\t"${this.id}i"[label="${this.key}"]\n`
        dot += `\t"${this.id}t"[label="${this.type}"]\n`
        dot += `\t"${this.id}default"[label="DEFAULT"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}t"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}default"\n`
        dot += `\t"stmt${this.id}" -- "${this.expr.id}"\n`
        dot += this.appendParent()
        return dot
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
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="SET"]\n`
        dot += `\t"${this.id}i"[label="@${this.key}"]\n`
        dot += `\t"${this.id}="[label="="]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}="\n`
        dot += `\t"stmt${this.id}" -- "${this.expr.id}"\n`
        dot += this.appendParent()
        return dot
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

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="CREATE"]\n`
        dot += `\t"${this.id}table"[label="TABLE"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"${this.id}cols"[label="Columns"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}table"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}cols"\n`
        dot += this.appendParent()
        return dot
    }

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

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="ALTER"]\n`
        dot += `\t"${this.id}table"[label="TABLE"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"${this.id}action"[label="${this.action}"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}table"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}action"\n`
        dot += this.appendParent()
        return dot
    }

    interpret(context, state){
        state.database.alterTable(this.tableID, this.action)
    }
}

class DropTable extends Stmt{
    constructor(id, tableID){
        super(id)
        this.tableID = tableID
    }

    _genDOT(){
        dot += `\t"${this.id}"[label="DROP"]\n`
        dot += `\t"${this.id}table"[label="TABLE"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}table"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += this.appendParent()
        return dot
    }

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

    _genDOT(){
        dot += `\t"${this.id}"[label="INSERT"]\n`
        dot += `\t"${this.id}into"[label="INTO"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"${this.id}cols"[label="Columns"]\n`
        dot += `\t"${this.id}vals"[label="Values"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}into"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}cols"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}vals"\n`
        dot += this.appendParent()
        return dot
    }

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

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="SELECT"]\n`
        if(this.selection === '*'){
            dot += `\t"${this.id}selection"[label="*"]\n`
        }
        else{
            dot += `\t"${this.id}selection"[label="Selection"]\n`
        }
        dot += `\t"${this.id}from"[label="FROM"]\n`
        dot += `\t"${this.id}i"[label="${this.tableID}"]\n`
        dot += `\t"stmt${this.id}" -- "${this.id}"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}selection"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}from"\n`
        dot += `\t"stmt${this.id}" -- "${this.id}i"\n`
        if(this.condition){
            dot += this.condition._genDOT()
            dot += `"${this.id}where"[label="WHERE"];`
            dot += `\t"stmt${this.id}" -- "${this.id}where"\n`
            dot += `\t"stmt${this.id}" -- "${this.condition.id}"\n`
        }
        dot += this.appendParent()
        return dot
    }

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

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="SELECT"]\n`
        dot += `\t"${this.id}expr"[label="Expressions"]\n`
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
        dot += `\t"${this.id}"[label="UPDATE"]\n`
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
