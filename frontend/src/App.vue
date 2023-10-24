<script>
export default {
    data() {
        return {
            input: '',
            output: '',
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
            str = (str === '') ? "\n" : str;
            this.output += '[saulc@localhost proy2]\n' + str
        },
        readFile() {
            const file = this.$refs.file.files[0]
            const fileReader = new FileReader()
            fileReader.onload = (res) => {
                this.input = res.target.result
            }
            fileReader.onerror = (err) => console.error(err)
            fileReader.readAsText(file)
        }
    }
}
</script>

<template>
    <nav class="navbar">
        <a href="#" class="logo">QueryCripter</a>
        <ul class="nav-links">
            <li class="nav-item">
                <input type="file" ref="file" @change="readFile">
            </li>
            <li class="nav-item"><a href="#" @click="interpret">Ejecutar</a></li>
            <li class="nav-item"><a href="#">Reportes</a></li>
        </ul>
    </nav>
    <div id="two-col-cont">
        <textarea class="col pan" :value="input" @input="getText" wrap="off"></textarea>
        <div class="col" id="output">
            <pre class="pan">{{ output }}</pre>
        </div>
    </div>
</template>
