<script>
    export default {
        props: {
            header: Array,
            records: Array
        }
    }
</script>

<template>
    <table>
        <thead>
            <tr>
                <th v-for="column in header">
                    {{ column }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in records">
                <td v-for="value in row">
                    {{ value }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style>
table {
  border: 2px solid #42b983;
  border-radius: 3px;
  background-color: #fff;
}

th {
  background-color: #42b983;
  color: rgba(255, 255, 255, 0.66);
  user-select: none;
}

td {
  background-color: #f9f9f9;
}

th,
td {
  min-width: 120px;
  padding: 10px 20px;
}
</style>
