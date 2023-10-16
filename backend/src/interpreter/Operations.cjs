const Types = require('./Types.cjs')

function sum(left, right){
    switch(left.type){
        case 'INT': 
            switch(right.type){
                case 'INT':
                case 'STRING':
                    return new Types.INT('INT', left + right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left + right)
                case 'DATE':
                    right.setDate(right.value.getDate() + left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        case 'DOUBLE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                case 'STRING':
                    return new Types.DOUBLE('DOUBLE', left + right)
                case 'DATE':
                    right.setDate(right.value.getDate() + left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        case 'DATE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                case 'STRING':
                    left.setDate(left.value.getDate() + right)
                    return left
                default:
                    return new Types.NULL('NULL')
            }
        case 'STRING': 
            switch(right.type){
                case 'INT': 
                    return new Types.INT('INT', left + right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left + right)
                case 'STRING':
                    return new Types.STRING('STRING', (''+left)+(''+right))
                case 'DATE':
                    right.setDate(right.value.getDate() + left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        default:
            return new Types.NULL('NULL')
    }
}

function sub(left, right){
    switch(left.type){
        case 'INT': 
            switch(right.type){
                case 'INT':
                case 'STRING':
                    return new Types.INT('INT', left - right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left - right)
                case 'DATE':
                    right.setDate(right.value.getDate() - left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        case 'DOUBLE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                case 'STRING':
                    return new Types.DOUBLE('DOUBLE', left - right)
                case 'DATE':
                    right.setDate(right.value.getDate() - left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        case 'DATE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                case 'STRING':
                    left.setDate(left.value.getDate() - right)
                    return left
                default:
                    return new Types.NULL('NULL')
            }
        case 'STRING': 
            switch(right.type){
                case 'INT': 
                    return new Types.INT('INT', left - right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left - right)
                case 'STRING':
                    return new Types.STRING('STRING', (''+left).replace(''+right,''))
                case 'DATE':
                    right.setDate(right.value.getDate() - left)
                    return right
                default:
                    return new Types.NULL('NULL')
            }
        default:
            return new Types.NULL('NULL')
    }
}

function mult(left, right){
    switch(left.type){
        case 'INT': 
            switch(right.type){
                case 'INT':
                    return new Types.INT('INT', left * right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left * right)
                default:
                    return new Types.NULL('NULL')
            }
        case 'DOUBLE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left * right)
                default:
                    return new Types.NULL('NULL')
            }
        default:
            return new Types.NULL('NULL')
    }
}

function div(left, right){
    switch(left.type){
        case 'INT': 
            switch(right.type){
                case 'INT':
                    return new Types.INT('INT', left / right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left / right)
                default:
                    return new Types.NULL('NULL')
            }
        case 'DOUBLE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left / right)
                default:
                    return new Types.NULL('NULL')
            }
        default:
            return new Types.NULL('NULL')
    }
}

function mod(left, right){
    switch(left.type){
        case 'INT': 
            switch(right.type){
                case 'INT':
                    return new Types.INT('INT', left % right)
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left % right)
                default:
                    return new Types.NULL('NULL')
            }
        case 'DOUBLE':
            switch(right.type){
                case 'INT': 
                case 'DOUBLE':
                    return new Types.DOUBLE('DOUBLE', left % right)
                default:
                    return new Types.NULL('NULL')
            }
        default:
            return new Types.NULL('NULL')
    }
}

function lessThan(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() < right.valueOf())
}

function greaterThan(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() > right.valueOf())
}

function lessThanOrEqual(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() <= right.valueOf())
}

function greaterThanOrEqual(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() >= right.valueOf())
}

function equals(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() === right.valueOf())
}

function diff(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() !== right.valueOf())
}

function and(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() && right.valueOf())
}

function or(left, right){
    return new Types.BOOLEAN('BOOLEAN', left.valueOf() || right.valueOf())
}

function not(operand){
    return new Types.BOOLEAN('BOOLEAN', !operand)
}

function neg(operand){
    switch(operand.type){
        case 'INT':
            return new Types.INT('INT', -operand)
        case 'DOUBLE':
            return new Types.DOUBLE('DOUBLE', -operand)
        default:
            return new Types.NULL('NULL')
    }
}

module.exports = {
    sum,
    sub,
    mult,
    div,
    mod,
    lessThan,
    lessThanOrEqual,
    greaterThan,
    greaterThanOrEqual,
    equals,
    diff,
    and,
    or,
    not,
    neg,
}
