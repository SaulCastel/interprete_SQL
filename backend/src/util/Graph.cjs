const fs = require('fs')
const {exec} = require('child_process')
const path = require('path')

function genDOT(stmts){
    let dot = 'graph AST {\n'
    dot += '\tordering=out\n'
    dot += '\tnode[shape=plaintext]\n'
    dot += stmts[0]._genDOT()
    dot += '\t"code0"[label="Statements0"]\n'
    dot += `\t"code0" -- "stmt${stmts[0].id}"\n`
    for (let i=1; i < stmts.length; i++){
        dot += `\t"code${i-1}" -- "stmt${stmts[i].id}"\n`
        dot += stmts[i]._genDOT()
        dot += `\t"code${i}"[label="Statements${i}"]\n`
        dot += `\t"code${i}" -- "code${i-1}"\n`
    }
    dot += `\t"code${stmts.length - 1}" -- "EOF"\n`
    dot += '}'
    writeToFile(dot)
}

function writeToFile(dot){
    const route = path.join(__dirname, '../../')
    const dotFile = 'ast.dot'
    const svgFile = 'ast.svg'
    try{
        fs.writeFileSync(route+dotFile, dot, 'utf8')
    }
    catch(err){
        console.error(err)
    }
    const cmd = `dot -Tsvg ${route+dotFile} -o ${route+svgFile}`
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
        }
    })
}

module.exports = genDOT
