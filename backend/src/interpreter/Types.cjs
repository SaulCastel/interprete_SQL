const escapeStr = require('./String.cjs')

class TYPE{
    constructor(type){
        this.type = type
    }
    setVal(){}
}

class INT extends TYPE{
    constructor(type, value){
        super(type)
        this.setVal(value)
    }
    setVal(value){
        this.value = Math.trunc(value)
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
        this.setVal(value)
        this.setDecimals(8)
    }
    setVal(value){
        this.value = Number(value)
    }
    setDecimals(num){
        this.decimals = num
    }
    valueOf(){
        return this.value
    }
    toString(){
        return this.value.toFixed(this.decimals)
    }
}

class DATE extends TYPE{
    constructor(type, value){
        super(type)
        this.setVal(value)
    }
    setVal(value){
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
        this.setVal(value)
    }
    setVal(value){
        this.value = escapeStr(String(value))
    }
    valueOf(){
        const num = Number(this.value)
        if(isNaN(num)){
            let sum = 0
            for(let i = 0; i < this.value.length; i++){
                sum += this.value.charCodeAt(i)
            }
            return sum
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
        this.setVal(value)
    }
    setVal(value){
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
        this.setVal()
    }
    setVal(){
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
