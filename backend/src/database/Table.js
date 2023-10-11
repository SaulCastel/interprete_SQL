export default class Table{
    constructor(columns){
        this.columns = {}
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
                this.columns[col].values.push(null)
            }
        }
        for(let i = 0; i < columns_arr.length; i++){
            this.columns[columns_arr[i]].values.push(values_arr[i].interpret(context))
        }
    }
}
