const escapeStr = require('../util/String.cjs')

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

    _genDOT(){
        let dot = ''
        dot += this.left._genDOT()
        dot += this.right._genDOT()
        dot += `\t"${this.id}"[label="Binary"]\n`
        dot += `\t"${this.id}op"[label="${this.op}"]\n`
        dot += `\t"${this.id}" -- "${this.left.id}"\n`
        dot += `\t"${this.id}" -- "${this.id}op"\n`
        dot += `\t"${this.id}" -- "${this.right.id}"\n`
        return dot
    }

    interpret(){
        switch(this.op){
            case '+':
                return this.left.interpret() + this.right.interpret()
            case '-':
                return this.left.interpret() - this.right.interpret()
            case '*':
                return this.left.interpret() * this.right.interpret()
            case '/':
                return this.left.interpret() / this.right.interpret()
            case '%':
                return this.left.interpret() % this.right.interpret()
            case '=':
                return this.left.interpret() === this.right.interpret()
            case '!=':
                return this.left.interpret() !== this.right.interpret()
            case '<':
                return this.left.interpret() < this.right.interpret()
            case '>':
                return this.left.interpret() > this.right.interpret()
            case '>=':
                return this.left.interpret() >= this.right.interpret()
            case '<=':
                return this.left.interpret() <= this.right.interpret()
            case 'AND':
                return this.left.interpret() && this.right.interpret()
            case 'OR':
                return this.left.interpret() || this.right.interpret()
        }
    }
}

class Unary extends Expr{
    constructor(id, operator, operand){
        super(id)
        this.operator = operator
        this.operand = operand
    }

    _genDOT(){
        let dot = ''
        dot += this.operand._genDOT()
        dot += `\t"${this.id}"[label="Unary"]\n`
        dot += `\t"${this.id}op"[label="${this.operator}"]\n`
        dot += `\t"${this.id}" -- "${this.id}op"\n`
        dot += `\t"${this.id}" -- "${this.operand.id}"\n`
        return dot
    }

    interpret(){
        switch(this.operator){
            case '-':
                return -this.operand.interpret()
            case 'NOT':
                return !this.operand.interpet()
        }
    }
}

class Group extends Expr{
    constructor(id, expr){
        super(id)
        this.expr = expr
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

    interpret(){
        return this.expr.interpret()
    }
}

class Literal extends Expr{
    constructor(id, type, value){
        super(id)
        this.type = type
        this.value = value
    }

    _genDOT(){
        let dot = `\t"${this.id}"[label="${this.type}"]\n`
        dot += `\t"${this.id}v"[label="${this.value}"]\n`
        dot += `\t"${this.id}" -- "${this.id}v"\n`
        return dot
    }

    interpret(){
        switch(this.type){
            case 'INT':
                return Number(this.value)
            case 'DOUBLE':
                return Number(this.value)
            case 'STRING':
                return escapeStr('' + this.value)
            case 'DATE':
                return '' + this.value
            case 'TRUE':
                return true
            case 'FALSE':
                return false
            case 'NULL':
                return null
        }
    }
}

module.exports = {
    Binary:     Binary,
    Unary:      Unary,
    Group:      Group,
    Literal:    Literal
}
