class Context{
    constructor(name, prev = null){
        this.name = name
        this.prev = prev
        this.symbols = {}
    }

    set(key, value, type){
        this.symbols[key] = new Variable(value, type)
    }

    get(key){
        const symbol = this.symbols[key]
        if(symbol === undefined){
            if (this.prev !== null){
                symbol = this.prev.get(key)
            }
        }
        return symbol
    }

    update(key, value){
        const symbol = this.get(key)
        if(symbol !== undefined){
            symbol.value = value
            this.symbols[key] = symbol
        }
    }
}

class Variable{
    constructor(value, type){
        this.value = value
        this.type = type
    }
}

module.exports = Context
