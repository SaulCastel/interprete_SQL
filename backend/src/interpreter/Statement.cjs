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

    interpret(){
        console.log(this.expr.interpret())
    }
}

module.exports = {
    Print: Print
}
