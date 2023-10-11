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

    alterTable(tableId, action){
        switch(action[0]){
            case 'ADD':
                this.tables[tableId].addCol(action[1], action[2])
                break;
            case 'DROP':
                this.tables[tableId].dropCol(action[1])
                break;
            case 'RENAME':
                this.renameTable(tableId, action[1])
                break;
            case 'RENAME_C':
                this.tables[tableId].renameCol(action[1], action[2])
                break;
        }
    }

    renameTable(id, newId){
        const table = this.tables[id]
        table.name = newId
        this.tables[newId] = table
        delete this.tables[id]
    }

    insertInto(tableId, columns, values, context){
        this.tables[tableId].insert(columns, values, context)
    }

    selectFrom(tableId, selection, condition, context){
        return this.tables[tableId].select(selection, condition, context)
    }
}
