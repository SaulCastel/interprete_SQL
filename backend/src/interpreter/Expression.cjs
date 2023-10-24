const Types = require('./Types.cjs')
const Operations = require('./Operations.cjs')

class Expr{
    constructor(id){
        this.id = id
    }

    interpret(){}
    _genDOT(){}
}

class Binary extends Expr{
    constructor(id, left, op, right){
        super(id)
        this.left = left
        this.op = op
        this.right = right
    }

    toString(){
        return this.left.toString() + this.op + this.right.toString()
    }

    _genDOT(){
        let dot = ''
        dot += this.left._genDOT()
        dot += this.right._genDOT()
        dot += `\t"${this.id}"[label="BinaryExpression"]\n`
        dot += `\t"${this.id}op"[label="${this.op}"]\n`
        dot += `\t"${this.id}" -- "${this.left.id}"\n`
        dot += `\t"${this.id}" -- "${this.id}op"\n`
        dot += `\t"${this.id}" -- "${this.right.id}"\n`
        return dot
    }

    interpret(context = null){
        const left = this.left.interpret(context)
        const right = this.right.interpret(context)
        switch(this.op){
            case '+':
                return Operations.sum(left, right)
            case '-':
                return Operations.sub(left, right)
            case '*':
                return Operations.mult(left, right)
            case '/':
                return Operations.div(left, right)
            case '%':
                return Operations.mod(left, right)
            case '=':
                return Operations.equals(left, right)
            case '!=':
                return Operations.diff(left, right)
            case '<':
                return Operations.lessThan(left, right)
            case '>':
                return Operations.greaterThan(left, right)
            case '>=':
                return Operations.greaterThanOrEqual(left, right)
            case '<=':
                return Operations.lessThanOrEqual(left, right)
            case 'AND':
                return Operations.and(left, right)
            case 'OR':
                return Operations.or(left, right)
        }
    }
}

class Unary extends Expr{
    constructor(id, operator, operand){
        super(id)
        this.operator = operator
        this.operand = operand
    }

    toString(){
        return this.operator + this.operand.toString()
    }

    _genDOT(){
        let dot = ''
        dot += this.operand._genDOT()
        dot += `\t"${this.id}"[label="UnaryExpression"]\n`
        dot += `\t"${this.id}op"[label="${this.operator}"]\n`
        dot += `\t"${this.id}" -- "${this.id}op"\n`
        dot += `\t"${this.id}" -- "${this.operand.id}"\n`
        return dot
    }

    interpret(context = null){
        switch(this.operator){
            case '-':
                return Operations.neg(this.operand.interpret(context))
            case 'NOT':
                return Operations.not(this.operand.interpret(context))
        }
    }
}

class Group extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    toString(){
        return this.expr.toString()
    }

    _genDOT(){
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="Group"]\n`
        dot += `\t"${this.id}l"[label="("]\n`
        dot += `\t"${this.id}r"[label=")"]\n`
        dot += `\t"${this.id}" -- "${this.id}l"\n`
        dot += `\t"${this.id}" -- "${this.expr.id}"\n`
        dot += `\t"${this.id}" -- "${this.id}r"\n`
        return dot
    }

    interpret(context = null){
        return this.expr.interpret(context)
    }
}

class Literal extends Expr{
    constructor(id, type, value){
        super(id)
        this.type = type
        this.value = value
    }

    toString(){
        return this.value.toString()
    }

    _genDOT(){
        let dot = `\t"${this.id}"[label="${this.type}"]\n`
        dot += `\t"${this.id}v"[label="${this.value}"]\n`
        dot += `\t"${this.id}" -- "${this.id}v"\n`
        return dot
    }

    interpret(context = null){
        switch(this.type){
            case 'INT':
                return new Types.INT(this.type, this.value)
            case 'DOUBLE':
                return new Types.DOUBLE(this.type, this.value)
            case 'STRING':
                return new Types.STRING(this.type, this.value)
            case 'DATE':
                return new Types.DATE(this.type, this.value)
            case 'BOOLEAN':
                if(typeof this.value === 'string'){
                    this.value = this.value.toLowerCase() === 'true'
                }
                return new Types.BOOLEAN(this.type, this.value)
            case 'NULL':
                return new Types.NULL(this.type)
        }
    }
}

class Variable extends Expr{
    constructor(id, name){
        super(id)
        this.name = name
    }

    toString(){
        return '@'+this.name
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="Variable"]\n`
        dot += `\t"${this.id}@"[label="${this.name}"]\n`
        dot += `\t"${this.id}v"[label="${this.name}"]\n`
        dot += `\t"${this.id}" -- "${this.id}@"\n`
        dot += `\t"${this.id}" -- "${this.id}v"\n`
        return dot
    }

    interpret(context){
        return context.get(this.name)
    }
}

class Identifier extends Expr{
    constructor(id, name){
        super(id)
        this.name = name
    }

    toString(){
        return this.name
    }

    _genDOT(){
        let dot = ''
        dot += `\t"${this.id}"[label="Identifier"]\n`
        dot += `\t"${this.id}v"[label="${this.name}"]\n`
        dot += `\t"${this.id}" -- "${this.id}v"\n`
        return dot
    }

    interpret(context){
        return context.get(this.name)
    }
}

class Cast extends Expr{
    constructor(id, expr, type){
        super(id)
        this.expr = expr
        this.type = type
    }

    toString(){
        return `cast ${this.expr.toString()} as ${this.type}`
    }

    _genDOT(){
        let dot = ''
        dot += this.expr._genDOT()
        dot += `\t"${this.id}"[label="FunctionCall"]\n`
        dot += `\t"${this.id}cast"[label="Cast"]\n`
        dot += `\t"${this.id}as"[label="AS"]\n`
        dot += `\t"${this.id}t"[label="${this.type}"]\n`
        dot += `\t"${this.id}" -- "${this.id}cast"\n`
        dot += `\t"${this.id}" -- "${this.expr.id}"\n`
        dot += `\t"${this.id}" -- "${this.id}as"\n`
        dot += `\t"${this.id}" -- "${this.id}t"\n`
        return dot
    }

    interpret(context){
        const expr = this.expr.interpret(context)
        return new Literal(null, this.type, expr).interpret()
    }
}

class Lower extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    toString(){
        return `lower ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const string = this.expr.interpret(context)
        const newString = string.toString().toLowerCase()
        return new Types.STRING('STRING', newString)
    }
}

class Upper extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    toString(){
        return `upper ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const string = this.expr.interpret(context)
        const newString = string.toString().toUpperCase()
        return new Types.STRING('STRING', newString)
    }
}

class Round extends Expr{
    constructor(id, expr, decimals){
        super(id)
        this.expr = expr
        this.decimals = decimals
    }

    toString(){
        return `round ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const result = this.expr.interpret(context).valueOf()
        let newNum
        if(this.decimals){
            const num = this.decimals.interpret(context).valueOf()
            newNum = new Types.DOUBLE('DOUBLE', result)
            newNum.setDecimals(num)
        }
        else{
            newNum = new Types.INT('INT', Math.round(result))
        }
        return newNum
    }
}

class Len extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    toString(){
        return `len ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const string = this.expr.interpret(context).toString()
        return new Types.INT('INT', string.length)
    }
}

class Truncate extends Expr{
    constructor(id, expr, decimals){
        super(id)
        this.expr = expr
        this.decimals = decimals
    }

    toString(){
        return `truncate ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const result = this.expr.interpret(context).valueOf()
        let newNum
        if(this.decimals){
            const num = this.decimals.interpret(context).valueOf()
            newNum = new Types.DOUBLE('DOUBLE', result)
            newNum.setDecimals(num)
        }
        else{
            newNum = new Types.INT('INT', result)
        }
        return newNum
    }
}

class TypeOf extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
    }

    toString(){
        return `typeOf ${this.expr.toString()}`
    }

    _genDOT(){
        let dot = ''
        return dot
    }

    interpret(context){
        const result = this.expr.interpret(context)
        return new Types.STRING('STRING', result.type)
    }
}

module.exports = {
    Binary,
    Unary,
    Group,
    Literal,
    Variable,
    Identifier,
    Cast,
    Lower,
    Upper,
    Round,
    Len,
    Truncate,
    TypeOf,
}
