const Types = require('./Types.cjs')

class Literal{
    constructor(id, type, value){
        this.id = id
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

    interpret(){
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
            case 'PROC':
                return new Types.PROC(this.type, this.value)
            case 'FUNC':
                return new Types.FUNC(this.type, this.value)
        }
    }
}

module.exports = Literal
