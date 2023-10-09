<script>
export default {
    data() {
        return {
            input: '',
            output: ''
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
            } catch (error) {
                console.error("Error:", error)
            }
        },
        getText(e) {
            this.input = e.target.value
        },
        updateOutput(str) {
            this.output += '[saul@olc1 ~]$ ' + str
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
</template>
