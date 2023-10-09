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

    interpret(context, output){
        output.messages.push(this.expr.interpret(context))
    }
}

class Declare extends Stmt{
    constructor(id, symbols){
        super(id)
        this.symbols = symbols
    }

    _genDOT(){
    }

    interpret(context, output){
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

    interpret(context, output){
        context.set(this.key, this.expr.interpret(), this.type)
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

    interpret(context, output){
        context.update(this.key, this.expr.interpret())
    }
}

module.exports = {
    Print: Print,
    Declare: Declare,
    DeclareDefault: DeclareDefault,
    Set: Set,
}
