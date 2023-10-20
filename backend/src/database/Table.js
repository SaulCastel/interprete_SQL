import Context from "../interpreter/Context.cjs"
import {NULL} from '../interpreter/Types.cjs'

export default class Table{
    constructor(name, columns){
        this.name = name
        this.columns = {}
        this.cardinality = 0
        for (const column of columns){
            this.addCol(column[0], column[1])
        }
    }

    addCol(id, type){
        this.columns[id] = {type: type, values: []}
    }

    renameCol(id, newId){
        const column = this.columns[id]
        this.columns[newId] = column
        delete this.columns[id]
    }

    dropCol(id){
        delete this.columns[id]
    }

    insert(columns_arr, values_arr, context){
        const all = Object.keys(this.columns)
        for(const col of all){
            if(!columns_arr.includes(col)){
                this.columns[col].values.push(new NULL('NULL'))
            }
        }
        for(let i = 0; i < columns_arr.length; i++){
            const expr = values_arr[i].interpret(context)
            this.columns[columns_arr[i]].values.push(expr)
        }
        this.cardinality++
    }

    update(selection, condition, context){
        const newValues = this.getNewValues(selection, context)
        const selected = Object.keys(newValues)
        for(let i = 0; i < this.cardinality; i++){
            const row = this.getRowAtIndex(i)
            const header = this.getHeaderContext(row, context)
            const result = condition.interpret(header).valueOf()
            if(result){
                for(const col of selected){
                    this.columns[col].values[i] = newValues[col]
                }
            }
        }
    }

    truncate(){
        const columns = Object.keys(this.columns)
        for(const col of columns){
            this.columns[col].values = []
        }
        this.cardinality = 0
    }

    delete(condition, context){
        const columns = Object.keys(this.columns)
        const records = []
        for(let i = 0; i < this.cardinality; i++){
            const row = this.getRowAtIndex(i)
            const header = this.getHeaderContext(row, context)
            const result = condition.interpret(header).valueOf()
            if(!result){
                records.push(row)
            }
        }
        this.truncate()
        let newCardinality = 0
        for(const record of records){
            for(let i = 0; i < columns.length; i++){
                this.columns[columns[i]].values.push(record[i])
            }
            newCardinality++
        }
        this.cardinality = newCardinality
    }

    getNewValues(selection, context){
        const newValues = {}
        for(const column of selection){
            newValues[column[0]] = column[1].interpret(context)
        }
        return newValues
    }

    select(selection, condition, context){
        const records = []
        for(let i = 0; i < this.cardinality; i++){
            const row = this.getRowAtIndex(i)
            const header = this.getHeaderContext(row, context)
            if(condition){
                const result = condition.interpret(header).valueOf()
                if(result){
                    records.push(this.applyExpressions(selection, row, header))
                }
            }
            else{
                records.push(this.applyExpressions(selection, row, header))
            }
        }
        return {
            header: this.getAlises(selection),
            records
        }
    }

    applyExpressions(selection, row, context){
        if(selection === '*'){
            return row.map(val => String(val))
        }
        const newRow = []
        for(const expr of selection){
            newRow.push(expr[0].interpret(context).toString())
        }
        return newRow
    }

    getAlises(selection){
        const column_list = Object.keys(this.columns)
        if(selection === '*'){
            return column_list
        }
        const aliases = []
        for(const column of selection){
            const alias = column[1]
            if(alias){
                aliases.push(alias)
            }else{
                aliases.push(column[0].toString())
            }
        }
        return aliases
    }

    getRowAtIndex(index){
        const row = []
        for(const col of Object.keys(this.columns)){
            row.push(this.columns[col].values[index])
        }
        return row
    }

    getHeaderContext(row, context){
        const header = new Context(`${this.name}_header`, context)
        const column_list = Object.keys(this.columns)
        for(let i = 0; i <  column_list.length; i++){
            const id = column_list[i]
            const type = this.columns[id].type
            header.set(id, type, row[i])
        }
        return header
    }
}
