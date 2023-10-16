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

    //para delete hay que poner this.cardinality--

    select(selection, condition, context){
        let column_list = this.getColumns(selection)
        const records = []
        for(let i = 0; i < this.cardinality; i++){
            const row = this.getRowAtIndex(column_list.columns, i)
            if(condition){
                const header = this.getHeaderContext(column_list.columns, row, context)
                const result = condition.interpret(header).valueOf()
                if(result){
                    records.push(row.map(cell => String(cell)))
                }
            }else{
                records.push(row.map(cell => String(cell)))
            }
        }
        return {
            header: [...column_list.aliases],
            records
        }
    }

    getColumns(selection){
        if(selection === '*'){
            const columns = Object.keys(this.columns)
            return {
                columns,
                aliases: columns
            }
        }
        const column_list = {
            columns: [],
            aliases: []
        }
        for(const col of selection){
            column_list.columns.push(col[0])
            if(col[1]){
                column_list.aliases.push(col[1])
            }else{
                column_list.aliases.push(col[0])
            }
        }
        return column_list
    }

    getRowAtIndex(column_list, index){
        const row = []
        for(const col of column_list){
            row.push(this.columns[col].values[index])
        }
        return row
    }

    getHeaderContext(column_list, row, context){
        const header = new Context(`${this.name}_header`, context)
        for(let i = 0; i < column_list.length; i++){
            const id = column_list[i]
            const type = this.columns[id].type
            header.set(id, type, row[i])
        }
        return header
    }
}
