const Literal = require('./Expression.cjs').Literal

class Context{
    constructor(name, prev = null){
        this.name = name
        this.prev = prev
        this.symbols = {}
    }

    set(key, type, value){
        this.symbols[key] = new Literal(null, type, value).interpret()
    }

    get(key){
        const symbol = this.symbols[key]
        if(symbol === undefined){
            if (this.prev !== null){
                return this.prev.get(key)
            }
        }
        return symbol
    }

    update(key, value){
        const symbol = this.get(key)
        if(symbol !== undefined){
            const newSymbol = new Literal(null, symbol.type, value).interpret()
            this.symbols[key] = newSymbol
        }
    }
}

module.exports = Context
