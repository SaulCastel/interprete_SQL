<script>
import Table from './components/Table.vue'
export default {
    components: {
        Table
    },
    data() {
        return {
            input: '',
            output: '',
            tables: undefined
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
                this.tables = result.queries
            } catch (error) {
                console.error("Error:", error)
            }
        },
        getText(e) {
            this.input = e.target.value
        },
        updateOutput(str) {
            str = (str === '') ? "\n" : str;
            this.output += '> ' + str
        }
    }
}
</script>

<template>
    <nav class="navbar">
        <a href="#" class="logo">QueryCripter</a>
        <ul class="nav-links">
            <li class="nav-item"><a href="#">Archivo</a></li>
            <li class="nav-item"><a href="#" @click="interpret">Ejecutar</a></li>
            <li class="nav-item"><a href="#">Reportes</a></li>
        </ul>
    </nav>
    <div id="two-col-cont">
        <textarea class="col pan" :value="input" @input="getText"></textarea>
        <div class="col" id="output">
            <pre class="pan">{{ output }}</pre>
            <div class="pan" id="table-view">
                <Table v-if="tables" v-for="table in tables" :header="table.header" :records="table.records"></Table>
                <p v-else>No se ha realizado ninguna consulta</p>
            </div>
        </div>
    </div>
</template>
