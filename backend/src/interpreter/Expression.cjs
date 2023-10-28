const Types = require('./Types.cjs')
const Operations = require('./Operations.cjs')
const Context = require('./Context.cjs')
const Literal = require('./Literal.cjs')

class Expr{
    constructor(id, tokens, callables, root='Expression'){
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

    interpret(context, state){
        const left = this.left.interpret(context, state)
        const right = this.right.interpret(context, state)
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

    interpret(context, state){
        switch(this.operator){
            case '-':
                return Operations.neg(this.operand.interpret(context, state))
            case 'NOT':
                return Operations.not(this.operand.interpret(context, state))
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

    interpret(context, state){
        return this.expr.interpret(context, state)
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
        dot += `\t"${this.id}@"[label="@"]\n`
        dot += `\t"${this.id}v"[label="${this.name}"]\n`
        dot += `\t"${this.id}" -- "${this.id}@"\n`
        dot += `\t"${this.id}" -- "${this.id}v"\n`
        return dot
    }

    interpret(context, state){
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

    interpret(context, state){
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
        return `cast(${this.expr.toString()} as ${this.type})`
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

    interpret(context, state){
        const expr = this.expr.interpret(context, state)
        return new Literal(null, this.type, expr).interpret()
    }
}

class Lower extends Expr{
    constructor(id, expr){
        super(
            id,
            ['LOWER', '(', '$0',')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
    }

    toString(){
        return `lower(${this.expr.toString()})`
    }

    interpret(context, state){
        const string = this.expr.interpret(context, state)
        const newString = string.toString().toLowerCase()
        return new Types.STRING('STRING', newString)
    }
}

class Upper extends Expr{
    constructor(id, expr){
        super(
            id,
            ['UPPER', '(', '$0',')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
    }

    toString(){
        return `upper(${this.expr.toString()})`
    }

    interpret(context, state){
        const string = this.expr.interpret(context, state)
        const newString = string.toString().toUpperCase()
        return new Types.STRING('STRING', newString)
    }
}

class Round extends Expr{
    constructor(id, expr, decimals){
        super(
            id,
            ['ROUND', '(', '$0', decimals.toString(),')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
        this.decimals = decimals
    }

    toString(){
        return `round(${this.expr.toString()})`
    }

    interpret(context, state){
        const result = this.expr.interpret(context, state).valueOf()
        let newNum
        if(this.decimals){
            const num = this.decimals.interpret(context, state).valueOf()
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
        super(
            id,
            ['LEN', '(', '$0',')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
    }

    toString(){
        return `len(${this.expr.toString()})`
    }

    interpret(context, state){
        const string = this.expr.interpret(context, state).toString()
        return new Types.INT('INT', string.length)
    }
}

class Truncate extends Expr{
    constructor(id, expr, decimals){
        super(
            id,
            ['TRUNCATE', '(', '$0', decimals.toString(),')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
        this.decimals = decimals
    }

    toString(){
        return `truncate(${this.expr.toString()})`
    }

    interpret(context, state){
        const result = this.expr.interpret(context, state).valueOf()
        let newNum
        if(this.decimals){
            const num = this.decimals.interpret(context, state).valueOf()
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
        super(
            id,
            ['TYPEOF', '(', '$0',')'],
            [expr],
            'FunctionCall'
        )
        this.expr = expr
    }

    toString(){
        return `typeOf(${this.expr.toString()})`
    }

    interpret(context, state){
        const result = this.expr.interpret(context, state)
        return new Types.STRING('STRING', result.type)
    }
}

class FunctionCall extends Expr{
    constructor(id, name, args){
        super(
            id,
            [name, '(', ...args.map(arg => arg.toString()), ')'],
            [],
            'FunctionCall'
        )
        this.name = name
        this.arguments = args
    }

    toString(){
        let signature = this.arguments[0].toString()
        for(let i = 1; i<this.arguments.length;i++){
            signature += ', '+this.arguments[i].toString()
        }
        return `${this.name}(${signature})`
    }

    interpret(context, state){
        const func = context.get(this.name).valueOf()
        const local = new Context(`FUNC ${this.name}`, null)
        for(let i = 0; i < this.arguments.length; i++){
            const value = this.arguments[i].interpret(context, state)
            local.set(func.parameters[i][0], func.parameters[i][1], value)
        }
        local.prev = context
        const returnExpr = func.block.interpret(local, state, false)
        return new Literal(null, func.returnType, returnExpr.valueOf()).interpret()
    }
}

module.exports = {
    Binary,
    Unary,
    Group,
    Variable,
    Identifier,
    Cast,
    Lower,
    Upper,
    Round,
    Len,
    Truncate,
    TypeOf,
    FunctionCall,
}
