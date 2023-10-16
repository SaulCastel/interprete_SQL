const escapeStr = require('./String.cjs')

class TYPE{
    constructor(type){
        this.type = type
    }
}

class INT extends TYPE{
    constructor(type, value){
        super(type)
        this.value = Number(value)
    }
    valueOf(){
        return this.value
    }
    toString(){
        return String(this.value)
    }
}

class DOUBLE extends TYPE{
    constructor(type, value){
        super(type)
        this.value = parseFloat(value)
    }
    valueOf(){
        return this.value
    }
    toString(){
        return String(this.value)
    }
}

class DATE extends TYPE{
    constructor(type, value){
        super(type)
        this.value = new Date(String(value)+'CST')
    }
    valueOf(){
        return this.value.getTime()
    }
    toString(){
        return this.value.toISOString().split('T')[0]
    }
    setDate(arg){
        this.value.setDate(arg)
    }
}

class STRING extends TYPE{
    constructor(type, value){
        super(type)
        this.value = escapeStr(String(value))
    }
    valueOf(){
        const num = Number(this.value)
        if(isNaN(num)){
            return this.value
        }
        return num
    }
    toString(){
        return this.value
    }
}

class BOOLEAN extends TYPE{
    constructor(type, value){
        super(type)
        this.value = value.valueOf()
    }
    valueOf(){
        return this.value
    }
    toString(){
        return String(this.value)
    }
}

class NULL extends TYPE{
    constructor(type){
        super(type)
        this.value = null
    }
    valueOf(){
        return this.value
    }
    toString(){
        return String(this.value)
    }
}

module.exports = {
    INT,
    DOUBLE,
    STRING,
    DATE,
    BOOLEAN,
    NULL
}
