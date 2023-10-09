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
}
