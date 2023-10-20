import Table from './Table.js'

export default class Database{
    constructor(){
        this.tables = {}
    }

    createTable(id, columns){
        this.tables[id] = new Table(id, columns)
    }

    dropTable(id){
        delete this.tables[id]
    }

    alterTable(tableID, action){
        switch(action[0]){
            case 'ADD':
                this.tables[tableID].addCol(action[1], action[2])
                break;
            case 'DROP':
                this.tables[tableID].dropCol(action[1])
                break;
            case 'RENAME':
                this.renameTable(tableID, action[1])
                break;
            case 'RENAME_C':
                this.tables[tableID].renameCol(action[1], action[2])
                break;
        }
    }

    renameTable(id, newId){
        const table = this.tables[id]
        table.name = newId
        this.tables[newId] = table
        delete this.tables[id]
    }

    insertInto(tableID, columns, values, context){
        this.tables[tableID].insert(columns, values, context)
    }

    selectFrom(tableID, selection, condition, context){
        return this.tables[tableID].select(selection, condition, context)
    }

    updateTable(tableID, selection, condition, context){
        this.tables[tableID].update(selection, condition, context)
    }

    truncateTable(tableID){
        this.tables[tableID].truncate()
    }

    deleteFrom(tableID, condition, context){
        this.tables[tableID].delete(condition, context)
    }
}
