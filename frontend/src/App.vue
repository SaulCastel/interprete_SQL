<script>
import Table from './components/Table.vue'
export default {
    components:{
        Table
    },
    data() {
        return {
            input: '',
            output: '',
            table: undefined
        }
    },
    methods: {
        async interpret() {
            try {
                const response = await fetch("http://127.0.0.1:3000/interpret", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ input: this.input }),
                })

                const result = await response.json();
                let output = ''
                for (const msg of result.messages) {
                    output += msg
                }
                this.updateOutput(output)
                this.table = result.table
            } catch (error) {
                console.error("Error:", error)
            }
        },
        getText(e) {
            this.input = e.target.value
        },
        updateOutput(str) {
            this.output += '[saul@olc1 ~]$ ' + str + "\n"
        }
    }
}
</script>

<template>
    <p>Entrada:</p>
    <textarea :value="input" @input="getText"></textarea>
    <button @click="interpret">Ejecutar</button>
    <p>Salida:</p>
    <pre>{{ output }}</pre>
    <div v-if="table">
        <p>Selección:</p>
        <Table :header="table.header" :records="table.records"></Table>
    </div>
    <p v-else>No se ha hecho ninguna consulta</p>
</template>
